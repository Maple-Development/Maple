import { writable, get } from 'svelte/store';  
import { Peer } from "peerjs";


export class User {
    private static SERVER = 'https://maple.kolf.pro'
    private static user = writable(null as Peer | null);

    public static register = async (username: string, password: string) => {
        try {
			const response = await fetch(`${this.SERVER}/login/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});
			const data = await response.json();
			return data;
		} catch (error) {
			return console.error('Error:', error);
		}
    }

    public static login = async (username: string, password: string) => {
        try {
            const response = await fetch(`${this.SERVER}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return console.error('Error:', error);
        }
    }

    public static createPeer = async (username: string) => {
        try {
            const peer = new Peer(username);
            this.user.set(peer);
            return peer;
        } catch (error) {
            return console.error('Error:', error);
        }
    }

    public static getPeer = () => {
        return get(this.user);
    }
}