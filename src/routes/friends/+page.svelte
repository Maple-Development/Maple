<script lang="ts">
	//@ts-nocheck
	import { Button } from '$lib/components/ui/button/index.js';
	import { onMount } from 'svelte';
	import { title, socket, friendNowPlaying, isLoggedIn, SavedUser, pendingRequests, friends } from '$lib/store';
	import { toast } from 'svelte-sonner';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { UserCheck, User, EllipsisVertical, AudioLines, UserPlus, UserX } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { UserManager } from '$lib/api/UserManager';
	import { Input } from '$lib/components/ui/input/index.js';

	import { OPFS } from '$lib/opfs';
	import type { Song } from '$lib/types/song';
	import type { Playlist } from '$lib/types/playlist';

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

{#if !$isLoggedIn}
	<h1 class="mt-10 text-center text-5xl font-black">You are not logged in!</h1>

	<Button href="/account/login" class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary">
		Login
	</Button>
{:else}
	<h1 class="mt-10 text-center text-3xl font-black">Friends</h1>

	<div class="mx-[10%] mt-10 flex flex-col rounded-lg border-4 border-border md:mx-[30%]">
		<div class=" mx-2 my-1 ml-2 rounded-lg">
			<div class="flex flex-col">
				<div class="flex flex-row justify-between">
					<div class="flex flex-row items-center">
						<UserPlus size={40} class="my-auto px-2 py-2" />
						<h2 class="inter-normal my-auto py-2 text-lg">Add Friend</h2>
						<Input
							bind:value={selectedFriend}
							placeholder="friend username"
							class="my-auto ml-2 w-48 px-2 py-2"
						/>
					</div>
					<div class="ml-2 flex items-center">
						<Button
							on:click={() => addFriend()}
							class="mx-1 my-1 h-10 w-10 bg-green-700 px-1 hover:bg-green-800"
						>
							<UserPlus size={20} color="white" />
						</Button>
					</div>
				</div>
			</div>
		</div>
		<Separator class="my-2 ml-4 mr-4 w-auto" />
		{#if $friends}
				{#each $friends as friend}
					<div class="mx-2 my-1 ml-2 flex flex-row justify-between rounded-lg hover:bg-secondary">
						<div class="flex flex-row">
							<img
								src="https://maple.kolf.pro/public/get/pfp/{friend.id}"
								on:error={(e) => (e.target.src = 'https://github.com/Cattn/Maple/blob/server/static/placeholder.png?raw=true')}
								alt="pfp"
								class="my-auto h-10 w-10 ml-1 rounded-full"
							/>
							<h2 class="inter-normal my-auto py-2 text-lg ml-2">{friend.name || friend.username} - {friend.username}</h2>
						</div>
						<div class="ml-2 flex items-center">
							<Button class="mx-1 my-1 h-10 w-10 px-1">
								<AudioLines size={20} color="white" />
							</Button>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button class="mx-1 my-1 h-10 w-10 bg-transparent px-1" builders={[builder]}>
										<EllipsisVertical size={20} color="white" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-56">
									<DropdownMenu.Label>Manage Friend</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<DropdownMenu.Item on:click={() => UserManager.removeFriend(friend.id)}>Remove Friend</DropdownMenu.Item>
									<DropdownMenu.Item>Transfer Library</DropdownMenu.Item>
									<DropdownMenu.Sub>
										<DropdownMenu.SubTrigger>
											<span>Send Playlist</span>
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
		{/if}
		<Separator class="my-2 ml-4 mr-4 w-auto" />
		{#if $pendingRequests}
			{#if $pendingRequests.length > 0}
				{#each $pendingRequests as request}
					{#await UserManager.getUserbyId(request.user_id) then user}
						<div class="mx-2 my-1 ml-2 flex flex-row justify-between rounded-lg hover:bg-secondary">
							<div class="flex flex-row">
								<UserPlus size={40} class="my-auto px-2 py-2" />
								<h2 class="inter-normal my-auto py-2 text-lg">{user.name} - {user.username}</h2>
							</div>
							<div class="ml-2 flex items-center">
								<Button on:click={() => UserManager.acceptRequest(request.user_id)} class="mx-1 my-1 h-10 w-10 bg-green-700 px-1 hover:bg-green-800">
									<UserCheck size={20} color="white" />
								</Button>
								<Button on:click={() => UserManager.rejectRequest(request.user_id)} class="mx-1 my-1 h-10 w-10 bg-red-700 px-1 hover:bg-red-800">
									<UserX size={20} color="white" />
								</Button>
							</div>
						</div>
					{/await}
				{/each}
			{/if}
		{/if}
	</div>

	<div class="ml-2 mt-2 flex flex-col items-center justify-center">
		<div class="flex flex-col items-center justify-center rounded-lg bg-primary p-5">
			<h1>{$friendNowPlaying.title || 'No song playing'}</h1>
			<h1>{$friendNowPlaying.artist || '...'}</h1>
			<h1>{$friendNowPlaying.album || '...'}</h1>
		</div>
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
	.inter-normal {
		font-family: 'Inter', serif;
		font-optical-sizing: auto;
		font-weight: 600;
		font-style: normal;
	}
</style>
