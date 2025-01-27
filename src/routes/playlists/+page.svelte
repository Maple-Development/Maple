<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Pencil, Check, Plus } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { Playlist } from '$lib/types/playlist';
	import type { Song } from '$lib/types/song';
	import { v4 as uuidv4 } from 'uuid';
	import { onMount } from 'svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { title } from '$lib/store';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import Controls from '$lib/components/controls.svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let doCreate = false;
	let editModeOn = true;
	let changedName = '';
	let changedDescription = '';
	let imageFile: Blob | null = null;
	let playlists: Playlist[] = [];
	let newPlaylist: Playlist = {
		id: uuidv4(),
		name: 'My Playlist',
		description: 'A playlist I just made!',
		image: '',
		tracks: []
	};
	let songs: Song[] = [];
	let addedSongs: String[] = [];
	let curSongs: Song[] = [];
	$: params = new URLSearchParams($page.url.search);
	$: {
		doCreate = params.get('create') === 'true';
	}

	onMount(async () => {
		songs = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		changedName = newPlaylist.name;
		changedDescription = newPlaylist.description;
		playlists = await OPFS.get().playlists();
		title.set('Playlists');
	});

	async function refresh() {
		playlists = [];
		let newPlaylists = await OPFS.get().playlists();
		songs = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		changedName = newPlaylist.name;
		changedDescription = newPlaylist.description;
		playlists = newPlaylists;
	}

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		const respons2e = await fetch(URL.createObjectURL(blob));
		if (respons2e.headers.get('Content-Length') === '0') {
			return '';
		}
		return URL.createObjectURL(blob);
	}

	async function editMode() {
		editModeOn = !editModeOn;

		if (!editModeOn && newPlaylist) {
			const doImage = imageFile !== null;
			const modifiedplaylist: Playlist = {
				id: newPlaylist.id,
				name: changedName,
				description: newPlaylist.description,
				image: doImage ? imageFile : newPlaylist.image,
				tracks: newPlaylist.tracks
			};
			OPFS.addPlaylist(modifiedplaylist);
			let updatedPlaylist = await OPFS.get().playlist(modifiedplaylist.id.toString());
			if (updatedPlaylist) {
				newPlaylist = updatedPlaylist;
			}
			doCreate = false;
			goto('/playlists');
			refresh();
		}
	}

	function handlePhotoChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = () => {
				const imageBlob = new Blob([reader.result as ArrayBuffer], { type: file.type });
				imageFile = imageBlob;
			};
		}
	}

	let open = false;

	function toggleSongSelection(song: Song) {
		const index = addedSongs.findIndex((s) => s === song.id);
		if (index === -1) {
			addedSongs = [...addedSongs, song.id];
			curSongs = [...curSongs, song];
		} else {
			addedSongs = addedSongs.filter((s) => s !== song.id);
			curSongs = curSongs.filter((s) => s.id !== song.id);
		}
	}

	$: isToggled = (song: Song) => addedSongs.includes(song.id);

	function submitSongs() {
		newPlaylist.tracks = addedSongs;
		open = false;
	}

	function formatDuration(duration: number): string {
		const roundedDuration = Math.round(duration);
		const minutes = Math.floor(roundedDuration / 60);
		const seconds = roundedDuration % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	let isOpenAlert = false;
	let selectedPlaylist: Playlist | null = null;

	function deletePlaylist() {
		if (selectedPlaylist) {
			OPFS.playlist().delete(selectedPlaylist);
			toast.success(`Playlist ${selectedPlaylist.name} deleted successfully!`);
			goto('/playlists');
			refresh();
		} else {
			console.error('Playlist not found');
		}
	}

	function openAlert(playlist: Playlist) {
		selectedPlaylist = playlist;
		isOpenAlert = true;
	}
</script>

{#if !doCreate}
	<div
		class="my-5 ml-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:ml-16 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
	>
		<a class="pointer" href={`/playlists?create=true`}>
			<div
				class="flex h-44 w-44 animate-pulse items-center justify-center rounded-sm bg-gray-500 md:h-52 md:w-52"
			>
				<Plus size={40} color="white" />
			</div>
			<div class="flex flex-row items-start">
				<div class="mt-4 flex h-full flex-col items-start">
					<h1 class="mb-1 text-lg font-bold leading-none text-foreground">Create Playlist</h1>
				</div>
			</div>
		</a>
		{#each playlists as playlist}
			<div class="flex flex-col items-start">
				{#await getImageUrl(playlist.image) then image}
				{#if image}
					<ContextMenu type={'playlist'} on:delete={(e) => openAlert(playlist)}>
						<a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
							<img
							src={image}
								class="h-44 w-44 rounded-sm object-cover md:h-52 md:w-52"
								alt={playlist.name}
							/>
						</a>
					</ContextMenu>
				{:else if image === ''}
					<ContextMenu type={'playlist'} on:delete={(e) => openAlert(playlist)}>
						<a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
							<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
						</a>
					</ContextMenu>
				{/if}
				{:catch error}
					<ContextMenu type={'playlist'} on:delete={(e) => openAlert(playlist)}>
						<a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
							<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
						</a>
					</ContextMenu>
				{/await}
				<div class="flex flex-row items-start">
					<div class="mt-4 flex h-full flex-col items-start">
						<h1 class="mb-1 text-lg font-bold leading-none text-foreground">{playlist.name}</h1>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="mt-4 flex h-fit justify-between rounded-md border-gray-600 p-5 px-10">
		<div class="flex">
			<div>
				{#if editModeOn}
					<input
						type="file"
						id="files"
						class="block w-full rounded-md border-2 border-gray-300 px-2 py-1 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200"
						accept="image/*"
						multiple
						on:change={(e) => handlePhotoChange(e)}
					/>
				{/if}
			</div>
			<div class="ml-7 flex flex-col items-start">
				<div class="flex flex-col items-start">
					{#if editModeOn}
						<h1
							bind:innerHTML={changedName}
							contenteditable="true"
							class="border-1 mb-1 rounded-sm border p-1 text-2xl font-bold leading-none text-foreground underline"
						>
							{newPlaylist?.name}
						</h1>
						<h1
							bind:innerHTML={changedDescription}
							contenteditable="true"
							class="border-1 rounded-sm border p-1 text-lg font-light leading-none text-slate-400 underline"
						>
							{newPlaylist?.description}
						</h1>
					{:else}
						<h1 class="mb-1 text-2xl font-bold leading-none text-foreground">
							{newPlaylist?.name}
						</h1>
						<h1 class="p text-lg font-light leading-none text-slate-400">
							{newPlaylist?.description}
						</h1>
					{/if}
				</div>
			</div>
		</div>
		<div>
			<Button
				class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
				on:click={() => editMode()}
			>
				{#if editModeOn}
					<Check size={20} color="white" />
				{:else}
					<Pencil size={20} color="white" />
				{/if}
			</Button>
		</div>
	</div>
	<Separator class="mb-4 ml-14 mt-1 w-[95%] pr-20"></Separator>

	<div class="mx-4 mb-5 mt-2 flex flex-col">
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-missing-attribute -->
		<a
			on:click={() => (open = true)}
			class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary"
		>
			<div class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary">
				<div class="mr-4 flex h-24 w-24 items-center justify-center bg-gray-500">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-white">
						<Plus size={20} color="black" />
					</div>
				</div>
				<div class="flex flex-grow flex-col items-start">
					<h1 class="mb-1 text-lg font-bold leading-none text-foreground">Add Track</h1>
				</div>
			</div>
		</a>
	</div>

	<div class="mx-4 mb-5 mt-2 flex flex-col">
		{#each curSongs as track}
			<div class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary">
				{#await getImageUrl(track.image) then image}
					<Lazy height={208} keep={true}>
						<img class="mr-4 h-24 w-24" src={image} alt={track.title} />
					</Lazy>
				{:catch error}
					<div class="mr-4 h-24 w-24 bg-gray-500"></div>
				{/await}
				<div class="flex flex-grow flex-col items-start">
					<h1 class="mb-1 text-lg font-bold leading-none text-foreground">{track.title}</h1>
					<h1 class="text-base font-light leading-none text-slate-400">{track.artist}</h1>
				</div>
				<div class="ml-4 flex flex-col items-end text-right">
					<h1 class="text-base font-light leading-none text-slate-400">
						{formatDuration(track.duration)}
					</h1>
					<h1 class="text-base font-light leading-none text-slate-400">{track.album}</h1>
				</div>
			</div>
		{/each}
	</div>

	<Drawer.Root bind:open>
		<Drawer.Content>
			<div class="mx-auto w-full max-w-lg">
				<Drawer.Header>
					<Drawer.Title>Select Tracks</Drawer.Title>
					<Drawer.Description>You can select multiple tracks</Drawer.Description>
				</Drawer.Header>
				<section data-vaul-no-drag>
					<ScrollArea class="h-72 w-full rounded-md border">
						{#each songs as song}
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								on:click={() => toggleSongSelection(song)}
								class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary"
							>
								<div class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary">
									<div class="mr-4 flex h-24 w-24 items-center justify-center bg-gray-500">
										{#await getImageUrl(song.image) then image}
											{#if isToggled(song)}
												<Lazy height={208} keep={true}>
													<img
														class="mr-4 h-24 w-24 border-2 border-green-400"
														src={image}
														alt={song.title}
													/>
												</Lazy>
											{:else}
												<Lazy height={208} keep={true}>
													<img class="mr-4 h-24 w-24" src={image} alt={song.title} />
												</Lazy>
											{/if}
										{:catch error}
											<div class="mr-4 h-24 w-24 bg-gray-500"></div>
										{/await}
									</div>
									<div class="flex flex-grow flex-col items-start">
										<h1 class="mb-1 text-lg font-bold leading-none text-foreground">
											{song.title}
										</h1>
										<h1 class="text-md mb-1 font-light leading-none text-slate-400">
											{song.artist}
										</h1>
									</div>
								</div>
							</a>
						{/each}
					</ScrollArea>
				</section>
				<Drawer.Footer>
					<Button on:click={() => submitSongs()}>Submit</Button>
					<Drawer.Close asChild let:builder>
						<Button builders={[builder]} variant="outline">Cancel</Button>
					</Drawer.Close>
				</Drawer.Footer>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}

<AlertDialog.Root bind:open={isOpenAlert}>
	<AlertDialog.Trigger></AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will COMPLETELY delete the playlist, it will NOT remove
				the tracks within the playlist.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={() => deletePlaylist()}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
