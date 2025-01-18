import { get } from 'svelte/store';
import { UserInfo, SavedUser } from '$lib/store';  
import type { User } from '$lib/types/user';
/* import pkg from 'peerjs';
const { Peer } = pkg; */


export class UserManager {
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
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
    
            const returnUser: User = {
                id: data.id,
                username: data.username,
                name: data.name,
                pfp: data.pfp ? `data:image/png;base64,${data.pfp}` : null
            };
            
            if (response.ok) {
                SavedUser.set(returnUser);
            }
            console.log(returnUser);
            return returnUser;
        } catch (error) {
            console.error('Error fetching user:', error);
            return {
                id: '',
                username: '',
                name: '',
                pfp: null
            };
        }
    };
    

    public static updateUser = async (user: User): Promise<User | void> => {
        try {
            let returnUser: User = {
                id: user.id,
                username: user.username,
                name: user.name,
                pfp: user.pfp,
            };
    
            
            if (user.pfp) {
                const formData = new FormData();
                formData.append('pfp', user.pfp); 
                formData.append('id', user.id);
    
                const pfpResponse = await fetch(`${this.SERVER}/user/manage/setProfile/${user.id}`, {
                    credentials: 'include',
                    method: 'POST',
                    body: formData, 
                });
    
                const pfpData = await pfpResponse.json();
                if (pfpData.ok) {
                    returnUser.pfp = pfpData.pfp; 
                }
            }
    
           
            if (user.name) {
                const nameResponse = await fetch(`${this.SERVER}/user/manage/setDisplayName/${user.id}`, {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ displayName: user.name }),
                });
    
                const nameData = await nameResponse.json();
                if (nameData.ok) {
                    returnUser.name = nameData.name; 
                }
            }
    
            return returnUser; 
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

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