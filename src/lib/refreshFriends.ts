import { friends, pendingRequests, SavedUser } from '$lib/store';
import { get } from 'svelte/store';
import { UserManager } from './api/UserManager';
import type { AddedFriend } from './types';

type FriendRelation = { user_id: string; friend_id: string };

export async function refreshRequests() {
	pendingRequests.set(await UserManager.getRequests());
}

export async function refreshFriends() {
	const fetchedFriends = await UserManager.getFriends();
	sortFriends(fetchedFriends);
}

async function sortFriends(unsorted: FriendRelation[]) {
	const userId = get(SavedUser).id;
	const newFriends = unsorted.map((friend: FriendRelation) => {
		if (friend.user_id === userId) {
			return { user_id: userId, friend_id: friend.friend_id };
		} else {
			return { user_id: userId, friend_id: friend.user_id };
		}
	});
	const friendsList: AddedFriend[] = [];
	const seenIds = new Set<string>();
	for (const friend of newFriends) {
		if (seenIds.has(friend.friend_id)) continue;
		const friendData = await UserManager.getUserbyId(friend.friend_id);
		if (!friendData) continue;
		seenIds.add(friendData.id);
		const newFriend: AddedFriend = {
			id: friendData.id,
			name: friendData.name,
			username: friendData.username,
			pfp: friendData.pfp,
			nowPlaying: friendData.nowPlaying
		};
		friendsList.push(newFriend);
	}
	friends.set(friendsList);
}