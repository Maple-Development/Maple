import { writable, get } from 'svelte/store';
import { UserInfo } from '$lib/store';  
/* import pkg from 'peerjs';
const { Peer } = pkg; */


export class User {
    private static SERVER = 'http://localhost:3000'
/*     private static user = writable(null as Peer | null);
 */
    public static register = async (username: string, password: string) => {
        try {
			const response: any = await fetch(`${this.SERVER}/login/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
                credentials: 'include',
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
            const returnName = data.user.username
            const id = data.user.id
            UserInfo.set({ username: returnName, id: id });
            return data;
        } catch (error) {
            return console.error('Error:', error);
        }
    }

    public static getUser = async () => {
        try {
            const response = await fetch(`${this.SERVER}/user/${get(UserInfo)?.id}`, {
                credentials: 'include',
                method: 'GET',
            });
            const data = await response.json();
            return JSON.stringify(data);
        } catch (error) {
            return JSON.stringify({ error: 'Failed to retrieve user data' });
        }
    }

    public static isLoggedIn = async () => {
        if (!get(UserInfo)?.id) {
            return false;
        }
        try {
            const response = await fetch(`${this.SERVER}/isAuthenticated/${get(UserInfo)?.id}`, {
                credentials: 'include',
                method: 'GET',
            });
            const data = await response.json();
            return data;
        } catch (error) {   
            return console.error('Error:', error);
        }
    }

    public static logOut = async () => {
        try {
            const response = await fetch(`${this.SERVER}/logout/${get(UserInfo)?.id}`, {
                credentials: 'include',
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                UserInfo.set({});
                location.reload();
            } else {
                return data;
            }
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