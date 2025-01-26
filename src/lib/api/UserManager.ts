import { get, writable } from 'svelte/store';
import { UserInfo, SavedUser } from '$lib/store';  
import type { User } from '$lib/types/user';
import { toast } from 'svelte-sonner';
import { Peer } from 'peerjs';

export class UserManager {
    private static DevServer = 'http://localhost:3000'
    private static PRODServer = 'https://maple.kolf.pro:443'
    private static SERVER = this.PRODServer  

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
            toast.success('Account created successfully!');
			return data;
		} catch (error) {
            toast.error('Error creating account: "' + error + '"');
			return console.error('Error:', error); 
		}
    }

    public static login = async (username: string, password: string) => {
        try {
            console.log('Attempting login with username:', username);
            console.log('Cookies before login:', document.cookie);
            console.log('Server endpoint:', this.SERVER + '/login');

            const response = await fetch(`${this.SERVER}/login`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            const returnName = data.user.username;
            const id = data.user.id;
            console.log('User logged in:', returnName, 'with ID:', id);

            UserInfo.set({ username: returnName, id: id });
            toast.success('Welcome back, ' + returnName + '!');
            console.log('UserInfo has been set:', { username: returnName, id: id });

            this.getUser();
            console.log('Initiated fetching user data');
            return data;
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('Error logging in: "' + error + '"');
            return console.error('Error:', error);
        }
    }

    public static getUser = async () => {
        try {
            const response = await fetch(`${this.SERVER}/get/user/${get(UserInfo)?.id}`, {
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
            const newUser = this.getUser();
            toast.success('Profile updated successfully!');
            return newUser; 
        } catch (error) {
            toast.error('Error updating profile: "' + error + '"');
            console.error('Error:', error);
            return console.error('Error:', error);
        }
    };
    

    public static isLoggedIn = async () => {
        console.log('Checking if user is logged in');
        if (!get(UserInfo)?.id) {
            console.log('UserInfo is empty');
            return false;
        }
        try {
            console.log('Fetching authentication status');
            const response = await fetch(`${this.SERVER}/get/isAuthenticated/${get(UserInfo)?.id}`, {
                credentials: 'include',
                method: 'GET',
            }).then(async (res) => {
                const response2 = res.clone();
                console.log('Response status:', await response2.text());
                return res;
            });
            console.log('Authentication status:', response);
            let data;
            try {
                data = await response.json();
            } catch (error) {
                console.error('Error parsing response:', error);
            }
            console.log('Authentication data:', data);
            return data;
        } catch (error) {   
            console.error('Error logging in:', error);
            toast.error('Error logging in: "' + error + '"');
            return console.error('Error:', error);
        }
    }

    public static logOut = async () => {
        try {
            const response = await fetch(`${this.SERVER}/get/logout/${get(UserInfo)?.id}`, {
                credentials: 'include',
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                UserInfo.set({});
            } else {
                return data;
            }
            UserInfo.set({});
            SavedUser.set({} as User);
            toast.success('Logout successful!');
            location.reload();
            return data;
        } catch (error) {
            toast.error('Error logging out: "' + error + '"');
            return console.error('Error:', error);
        }
    }

   /*  public static addFriend = async (friend: string) => {
        try {
           socket.emit('addFriend', { friendId: friend });
        } catch (error) {
            toast.error('Error adding friend: "' + error + '"');
            return console.error('Error:', error);
        }
    } */
}