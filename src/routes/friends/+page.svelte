<script lang="ts">
	//@ts-nocheck
	import { UserManager } from '$lib/api/UserManager';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { friends, isLoggedIn, pendingRequests, title } from '$lib/store';
	import { AudioLines, EllipsisVertical, Music2, UserCheck, UserPlus, UserX } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { OPFS } from '$lib/opfs';
	import type { Playlist, Song } from '$lib/types';

	let tracks: Song[] = [];
	let playlists: Playlist[] = [];
	let selectedFriend = '';

	onMount(async () => {
		tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		playlists = await OPFS.get().playlists();
		title.set('Friends');
	});

	async function addFriend() {
		const selectedUser = (await UserManager.getUserName(selectedFriend)).id;
		UserManager.addFriend(selectedUser);
		toast.success('Friend request sent to: ' + selectedFriend);
	}
</script>

<div class=" mx-auto max-w-4xl px-4 py-4 sm:py-8">
	{#if !$isLoggedIn}
		<div class="text-center">
			<h1 class="mb-4 text-2xl font-semibold">You are not logged in!</h1>
			<Button href="/account/login" variant="secondary">
				Login
			</Button>
		</div>
	{:else}
		<div class="mb-6 text-center sm:mb-8">
			<h1 class="mb-2 text-2xl font-semibold">Friends</h1>
			<p class="text-muted-foreground">Manage your friends and friend requests</p>
		</div>

		<Card class="mb-6 p-4 sm:p-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<UserPlus class="h-5 w-5 text-muted-foreground" />
					<div>
						<h2 class="text-lg font-medium">Add Friend</h2>
						<p class="text-sm text-muted-foreground">Enter a username to send a friend request</p>
					</div>
				</div>
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Input
						bind:value={selectedFriend}
						placeholder="Enter username"
						class="w-full sm:w-48"
					/>
					<Button
						on:click={() => addFriend()}
						variant="secondary"
						class="w-full sm:w-auto"
					>
						<UserPlus class="mr-2 h-4 w-4" />
						Add
					</Button>
				</div>
			</div>
		</Card>

		{#if $friends}
			<Card class="mb-6">
				<div class="p-4 sm:p-6">
					<h2 class="mb-4 text-lg font-medium">Your Friends</h2>
					<div class="space-y-4">
						{#each $friends as friend}
							<div class="flex flex-col gap-4 rounded-lg p-4 hover:bg-secondary sm:flex-row sm:items-center sm:justify-between">
								<div class="flex min-w-0 items-center gap-4">
									<!-- svelte-ignore a11y-img-redundant-alt -->
									<img
										src="https://api.maple.music/public/get/pfp/{friend.id}"
										on:error={(e) => (e.target.src = 'https://github.com/Cattn/Maple/blob/server/static/placeholder.png?raw=true')}
										alt="Profile picture"
										class="h-10 w-10 flex-shrink-0 rounded-full"
									/>
									<div class="min-w-0 flex-1">
										<h3 class="truncate font-medium">{friend.name || friend.username}</h3>
										<p class="truncate text-sm text-muted-foreground">@{friend.username}</p>
										{#if friend.nowPlaying}
											<div class="mt-1 flex items-center gap-2">
												<Music2 class="h-4 w-4 flex-shrink-0 text-green-500" />
												<p class="truncate text-sm text-muted-foreground">
													{friend.nowPlaying.title || 'Unknown Track'} - {friend.nowPlaying.artist || 'Unknown Artist'}
												</p>
											</div>
										{/if}
									</div>
								</div>
								<div class="flex flex-shrink-0 items-center gap-2">
									<Button variant="ghost" size="icon">
										<AudioLines class="h-4 w-4" />
									</Button>
									<DropdownMenu.Root>
										<DropdownMenu.Trigger asChild let:builder>
											<Button variant="ghost" size="icon" builders={[builder]}>
												<EllipsisVertical class="h-4 w-4" />
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content class="w-56">
											<DropdownMenu.Label>Manage Friend</DropdownMenu.Label>
											<DropdownMenu.Separator />
											<DropdownMenu.Item on:click={() => UserManager.removeFriend(friend.id)}>
												<UserX class="mr-2 h-4 w-4" />
												Remove Friend
											</DropdownMenu.Item>
											<DropdownMenu.Item>
												<AudioLines class="mr-2 h-4 w-4" />
												Transfer Library
											</DropdownMenu.Item>
											<DropdownMenu.Sub>
												<DropdownMenu.SubTrigger>
													<Music2 class="mr-2 h-4 w-4" />
													Send Playlist
												</DropdownMenu.SubTrigger>
												<DropdownMenu.SubContent side="right">
													{#if playlists.length > 0}
														{#each playlists as playlist}
															<DropdownMenu.Item>
																<span>{playlist.name}</span>
															</DropdownMenu.Item>
														{/each}
													{:else}
														<DropdownMenu.Item disabled>
															<span>No Playlists</span>
														</DropdownMenu.Item>
													{/if}
												</DropdownMenu.SubContent>
											</DropdownMenu.Sub>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</Card>
		{/if}

		{#if $pendingRequests}
			{#if $pendingRequests.length > 0}
				<Card>
					<div class="p-4 sm:p-6">
						<h2 class="mb-4 text-lg font-medium">Friend Requests</h2>
						<div class="space-y-4">
							{#each $pendingRequests as request}
								{#await UserManager.getUserbyId(request.user_id) then user}
									<div class="flex flex-col gap-4 rounded-lg p-4 hover:bg-secondary sm:flex-row sm:items-center sm:justify-between">
										<div class="flex items-center gap-4">
											<UserPlus class="h-10 w-10 text-muted-foreground" />
											<div>
												<h3 class="font-medium">{user.name}</h3>
												<p class="text-sm text-muted-foreground">@{user.username}</p>
											</div>
										</div>
										<div class="flex items-center gap-2">
											<Button
												on:click={() => UserManager.acceptRequest(request.user_id)}
												variant="secondary"
												size="icon"
											>
												<UserCheck class="h-4 w-4" />
											</Button>
											<Button
												on:click={() => UserManager.rejectRequest(request.user_id)}
												variant="destructive"
												size="icon"
											>
												<UserX class="h-4 w-4" />
											</Button>
										</div>
									</div>
								{/await}
							{/each}
						</div>
					</div>
				</Card>
			{/if}
		{/if}
	{/if}
</div>
