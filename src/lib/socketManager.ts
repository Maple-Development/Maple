import { socket as importedSocket, friendNowPlaying, friends, pendingRequests, SavedUser } from '$lib/store';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { browser } from '$app/environment';
import { UserManager } from './api/UserManager';
import type { AddedFriend } from './types/addedfriends';

let fetchedFriends: [] = [];

export const socketManager = () => {
	if (browser) {
		let socket = get(importedSocket);

		socket?.on('friendRequest', async (data) => {
			const id = data.id;
			const friend = await UserManager.getUserbyId(id);
			toast.success('Friend request from: ' + friend.name + ' (' + friend.username + ')',
				{
					action: {
						label: 'Accept',
						onClick: () => {
							UserManager.acceptRequest(id);
						}
					},
				}
			);
			pendingRequests.set(data);
		});

		socket?.on('notFound', async (data) => {
			toast.error('Friend request failed: User not found');
		});

		socket?.on('error', async (data) => {
			toast.error(data);
		});

		socket?.on('requestAccepted', async (data) => {
			console.log(data);
			const id = data.id;
			const friend = await UserManager.getUserbyId(id);
			toast.success(friend.name + ' (' + friend.username + ') accepted your friend request!');
			fetchedFriends = await UserManager.getFriends();
			sortFriends(fetchedFriends);
		});

		socket?.on('nowPlaying', async (data) => {
			const id = data.id;
			const friend = await UserManager.getUserbyId(id);
			toast.success('Now playing: ' + friend.name + ' (' + friend.username + ')');
			friendNowPlaying.set(data.nowPlaying);
		});
	}
};


async function sortFriends(unsorted: any) {
	let newFriends = unsorted.map((friend: { user_id: any; friend_id: any; }) => {
		if (friend.user_id === get(SavedUser).id) {
			return { user_id: get(SavedUser).id, friend_id: friend.friend_id };
		} else {
			return { user_id: get(SavedUser).id, friend_id: friend.user_id };
		}
	});
	newFriends.forEach(async (friend: any) => {
		const friendData = await UserManager.getUserbyId(friend.friend_id);
		const newFriend: AddedFriend = {
			id: friendData.id,
			name: friendData.name,
			username: friendData.username
		}
		friends.set([...get(friends), newFriend]);
	});
}