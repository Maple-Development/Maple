import { UserPeer } from '$lib/store';
import { Peer } from 'peerjs';
export class PeerManager {
	public static createPeer = async () => {
		try {
			const peer = new Peer();
			UserPeer.set(peer);
			return peer;
		} catch (error) {
			return console.error('Error:', error);
		}
	};
}
