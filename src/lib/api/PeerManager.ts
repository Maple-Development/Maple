import { UserPeer } from '$lib/store';
import Peer, { DataConnection } from 'peerjs';
import { get } from 'svelte/store';
import type { PeerData } from '$lib/types/peer';
import { DataType } from '$lib/types/peer';
import { toast } from 'svelte-sonner';
import download from 'js-file-download';

interface PeerConnections {
	[key: string]: DataConnection[];
}

export class PeerManager {
	public static getPeer = async () => {
		const peer = get(UserPeer);
		if (peer) {
			return peer;
		}
		return null;
	}

	public static createPeer = async () => {
		try {
			const response = await fetch('https://api.maple.music/peerjs/generate-id', {
				credentials: 'include'
			});
			
			if (!response.ok) {
				throw new Error('Failed to get authenticated ID');
			}

			const { id } = await response.json();

			const peer = new Peer(id, {
				host: 'api.maple.music',
				port: 443,
				secure: true,
				path: '/peerjs'
			});

			await new Promise((resolve, reject) => {
				peer.on('open', (id) => {
					console.log('[PEER] Connected with ID:', id);
					resolve(id);
				});
				peer.on('error', (error) => {
					console.error('[PEER] Error:', error);
					reject(error);
				});
			});

			UserPeer.set(peer);
			return peer;
		} catch (error) {
			console.error('[PEER] Error creating peer:', error);
			return null;
		}
	};

	public static onIncomingConnection = (callback: (conn: DataConnection) => void) => {
		const peer = get(UserPeer);
		if (!peer) {
			console.error('[PEER] No peer instance found');
			return;
		}

		peer.on('connection', (conn) => {
			console.log('[PEER] Incoming connection from:', conn.peer);
			callback(conn);
		});
	};

	public static onConnectionDisconnected = (peerId: string, callback: () => void) => {
		const peer = get(UserPeer);
		if (!peer) {
			console.error('[PEER] No peer instance found');
			return;
		}

		const connections = peer.connections as PeerConnections;
		const conn = connections[peerId]?.[0];
		if (!conn) {
			console.error('[PEER] No connection found for peer:', peerId);
			return;
		}

		conn.on('close', () => {
			console.log('[PEER] Connection closed with:', peerId);
			callback();
		});
	};

	public static onConnectionReceiveData = (peerId: string, callback: (data: PeerData) => void) => {
		const peer = get(UserPeer);
		if (!peer) {
			console.error('[PEER] No peer instance found');
			return;
		}

		const connections = peer.connections as PeerConnections;
		const conn = connections[peerId]?.[0];
		if (!conn) {
			console.error('[PEER] No connection found for peer:', peerId);
			return;
		}

		conn.on('data', (receivedData: unknown) => {
			console.log('[PEER] Received data from:', peerId);
			const data = receivedData as PeerData;
			
			if (data.dataType === DataType.FILE && data.file) {
				toast.success(`Received file ${data.fileName} from ${peerId}`);
				if (data.fileName && data.fileType) {
					const fileName = data.fileName;
					data.file.arrayBuffer().then(buffer => {
						const blob = new Blob([buffer], { type: data.fileType });
						download(blob, fileName);
					});
				}
			} else if (data.message) {
				toast.info(`Message from ${peerId}: ${data.message}`);
			}
			
			callback(data);
		});
	};

	public static sendData = async (peerId: string, data: PeerData): Promise<void> => {
		const peer = get(UserPeer);
		if (!peer) {
			console.error('[PEER] No peer instance found');
			throw new Error('Peer not initialized');
		}

		const conn = peer.getConnection(peerId, 'data') as DataConnection;
		if (!conn) {
			console.error('[PEER] No data connection found for peer:', peerId);
			throw new Error('No data connection to peer');
		}

		try {
			conn.send(data);
			console.log('[PEER] Data sent to:', peerId);
		} catch (error) {
			console.error('[PEER] Error sending data:', error);
			throw error;
		}
	};
}
