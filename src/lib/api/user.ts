import { writable, get } from 'svelte/store';  
/* import pkg from 'peerjs';
const { Peer } = pkg; */


export class User {
    private static SERVER = 'http://localhost:3000'
/*     private static user = writable(null as Peer | null);
 */
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
            console.log(document.cookie);
            console.log(this.SERVER + '/login');
            const response = await fetch(`${this.SERVER}/login`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return console.error('Error:', error);
        }
    }

    /* public static createPeer = async (username: string) => {
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
    } */
}