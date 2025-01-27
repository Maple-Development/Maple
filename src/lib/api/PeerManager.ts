import { Peer } from 'peerjs';
import { UserPeer, SavedUser } from '$lib/store';
import { get } from 'svelte/store';

export class PeerManager {
	public static createPeer = async () => {
		try {
			const peer = new Peer(get(SavedUser).username);
			UserPeer.set(peer);
			return peer;
		} catch (error) {
			return console.error('Error:', error);
		}
	};
}
