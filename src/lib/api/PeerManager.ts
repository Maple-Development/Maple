import { UserPeer } from '$lib/store';
import Peer from 'peerjs';

export class PeerManager {
	public static createPeer = async () => {
		try {
			const peer = new Peer('', {
				host: 'maple.kolf.pro',
				port: 3000,
				secure: true,
				path: '/peerjs'
			});
			UserPeer.set(peer);
			return peer;
		} catch (error) {
			return console.error('Error:', error);
		}
	};
}
