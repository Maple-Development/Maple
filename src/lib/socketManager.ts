import { socket as importedSocket, friendNowPlaying } from '$lib/store';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { browser } from '$app/environment';
import { UserManager } from './api/UserManager';


export const socketManager = () => {
    if (browser) {
        let socket = get(importedSocket);

        socket?.on('friendRequest', async (data) => {
            const id = data.id;
            const friend = await UserManager.getUserbyId(id);
            toast.success('Friend request from: ' + friend.name + ' (' + friend.username + ')');
        });

        socket?.on('notFound', async (data) => {
            toast.error('Friend request failed: User not found');
        });

        socket?.on('nowPlaying', async (data) => {
            const id = data.id;
            const friend = await UserManager.getUserbyId(id);
            toast.success('Now playing: ' + friend.name + ' (' + friend.username + ')');
            friendNowPlaying.set(data.nowPlaying);
            console.log(data.nowPlaying);
        });
    }
}