<script lang="ts">
	import { page } from '$app/stores';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import Button from '$lib/components/ui/button/button.svelte';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { OPFS } from '$lib/opfs';
	import { title } from '$lib/store';
	import type { Playlist, Song } from '$lib/types';
	import { Check, Pencil, Plus, Search } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { goto } from '$app/navigation';
	// @ts-ignore
	import Lazy from 'svelte-lazy';

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
	let searchQuery = '';
	let filteredSongs: Song[] = [];
	$: params = new URLSearchParams($page.url.search);
	$: {
		doCreate = params.get('create') === 'true';
	}

	onMount(async () => {
		songs = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		filteredSongs = songs;
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

	function filterSongs() {
		filteredSongs = songs.filter(song =>
			song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
			song.album.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}
</script>

{#if !doCreate}
	<div class="px-12 py-8">
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			<a class="pointer" href={`/playlists?create=true`}>
				<div class="group relative flex flex-col items-start transition-all duration-200 hover:scale-[1.02]">
					<div class="flex h-44 w-44 animate-pulse items-center justify-center rounded-lg bg-muted md:h-52 md:w-52">
						<Plus size={40} color="white" />
					</div>
					<div class="mt-3 flex w-full flex-col items-start space-y-1">
						<h1 class="line-clamp-1 w-full text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-lg">Create Playlist</h1>
					</div>
				</div>
			</a>
			{#each playlists as playlist}
				<div class="group relative mr-2 flex flex-col items-start transition-all duration-200 hover:scale-[1.02]">
					{#await getImageUrl(playlist.image) then image}
						{#if image}
							<ContextMenu type={'playlist'} on:delete={(e) => openAlert(playlist)}>
								<a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
									<img
										class="h-44 w-44 rounded-lg object-cover shadow-lg transition-all duration-300 group-hover:shadow-xl md:h-52 md:w-52"
										src={image}
										alt={playlist.name}
									/>
								</a>
							</ContextMenu>
						{:else}
							<ContextMenu type={'playlist'} on:delete={(e) => openAlert(playlist)}>
								<!-- svelte-ignore a11y_consider_explicit_label -->
								<a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
									<div class="h-44 w-44 animate-pulse rounded-lg bg-muted md:h-52 md:w-52"></div>
								</a>
							</ContextMenu>
						{/if}
						{:catch error}
							<ContextMenu type={'playlist'} on:delete={(e) => openAlert(playlist)}>
								<!-- svelte-ignore a11y_consider_explicit_label -->
								<a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
									<div class="h-44 w-44 animate-pulse rounded-lg bg-muted md:h-52 md:w-52"></div>
								</a>
							</ContextMenu>
						{/await}
						<div class="mt-3 flex w-full flex-col items-start space-y-1">
							<h1 class="line-clamp-1 w-full text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-lg">
								{playlist.name}
							</h1>
						</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="px-12 py-8">
		<div class="mb-8 rounded-lg border bg-card p-4 shadow-sm md:p-6">
			<div class="flex flex-col items-center gap-6 md:flex-row md:items-start">
				<div class="relative">
					{#if editModeOn}
						<div class="group relative">
							<div class="h-44 w-44 rounded-lg bg-muted md:h-64 md:w-64">
								<div class="flex h-full items-center justify-center">
									<Plus size={40} color="white" />
								</div>
							</div>
							<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
								<label
									for="playlist-image"
									class="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
								>
									Add Image
								</label>
								<input
									id="playlist-image"
									type="file"
									class="hidden"
									accept="image/*"
									on:change={(e) => handlePhotoChange(e)}
								/>
							</div>
						</div>
					{/if}
				</div>

				<div class="flex flex-1 flex-col space-y-4">
					<div class="flex items-center justify-between">
						<div class="flex-1">
							{#if editModeOn}
								<div class="space-y-2">
									<label for="playlist-name" class="text-sm font-medium">Playlist Name</label>
									<input
										id="playlist-name"
										bind:value={changedName}
										class="w-full rounded-md border bg-background px-3 py-2 text-xl font-bold shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:text-2xl"
										placeholder="Playlist name"
									/>
								</div>
							{:else}
								<h1 class="text-2xl font-bold text-foreground md:text-3xl">{newPlaylist?.name}</h1>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<Button
								class="h-9 w-9 p-0"
								variant="ghost"
								on:click={() => editMode()}
							>
								{#if editModeOn}
									<Check class="h-5 w-5" />
								{:else}
									<Pencil class="h-5 w-5" />
								{/if}
							</Button>
						</div>
					</div>

					<div class="space-y-4">
						{#if editModeOn}
							<div class="space-y-2">
								<label for="playlist-description" class="text-sm font-medium">Description</label>
								<input
									id="playlist-description"
									bind:value={changedDescription}
									class="w-full rounded-md border bg-background px-3 py-2 text-base shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									placeholder="Playlist description"
								/>
							</div>
						{:else}
							<div class="mt-2 space-y-1">
								<p class="text-base font-medium text-muted-foreground/80">{newPlaylist?.description}</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="mx-0 mb-5 mt-2 flex flex-col md:mx-4">
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<a
				on:click={() => (open = true)}
				class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary"
			>
				<div class="flex flex-row items-center">
					<div class="mr-4 flex h-16 w-16 items-center justify-center bg-gray-500 md:h-24 md:w-24">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-white md:h-12 md:w-12">
							<Plus size={16} color="black" class="md:size-5" />
						</div>
					</div>
					<div class="flex flex-grow flex-col items-start">
						<h1 class="text-lg font-bold leading-none text-foreground">Add Track</h1>
					</div>
				</div>
			</a>
		</div>

		<div class="mx-0 mb-5 mt-2 flex flex-col md:mx-4">
			{#each curSongs as track}
				<div class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary">
					{#await getImageUrl(track.image) then image}
						<Lazy height={208} keep={true}>
							<img class="mr-4 h-16 w-16 rounded-md object-cover md:h-24 md:w-24" src={image} alt={track.title} />
						</Lazy>
					{:catch error}
						<div class="mr-4 h-16 w-16 bg-gray-500 md:h-24 md:w-24"></div>
					{/await}
					<div class="flex flex-grow flex-col items-start">
						<h1 class="text-base font-bold leading-none text-foreground md:text-lg">{track.title}</h1>
						<h1 class="text-sm font-light leading-none text-slate-400 md:text-base">{track.artist}</h1>
					</div>
					<div class="ml-4 flex flex-col items-end text-right">
						<h1 class="text-sm font-light leading-none text-slate-400 md:text-base">
							{formatDuration(track.duration)}
						</h1>
						<h1 class="text-sm font-light leading-none text-slate-400 md:text-base">{track.album}</h1>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<Drawer.Root bind:open>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-4xl">
			<Drawer.Header>
				<Drawer.Title>Add Tracks to Playlist</Drawer.Title>
				<Drawer.Description>Search and select tracks to add to your playlist</Drawer.Description>
			</Drawer.Header>
			<section data-vaul-no-drag>
				<div class="mb-4 px-4">
					<div class="relative">
						<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search tracks..."
							class="w-full rounded-md border bg-background px-9 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							bind:value={searchQuery}
							on:input={() => filterSongs()}
						/>
					</div>
				</div>
				<ScrollArea class="h-[60vh] w-full rounded-md border">
					{#each filteredSongs as song}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-missing-attribute -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<a
							on:click={() => toggleSongSelection(song)}
							class="flex flex-row items-center rounded-sm px-4 py-3 hover:bg-secondary"
						>
							<div class="flex flex-row items-center">
								<div class="mr-4 flex h-16 w-16 items-center justify-center bg-gray-500">
									{#await getImageUrl(song.image) then image}
										{#if isToggled(song)}
											<Lazy height={208} keep={true}>
												<img
													class="h-16 w-16 border-2 border-green-400 object-cover"
													src={image}
													alt={song.title}
												/>
											</Lazy>
										{:else}
											<Lazy height={208} keep={true}>
												<img class="h-16 w-16 object-cover" src={image} alt={song.title} />
											</Lazy>
										{/if}
									{:catch error}
										<div class="h-16 w-16 bg-gray-500"></div>
									{/await}
								</div>
								<div class="flex flex-grow flex-col items-start">
									<h1 class="text-lg font-bold leading-none text-foreground">
										{song.title}
									</h1>
									<h1 class="text-md mt-1 font-light leading-none text-slate-400">
										{song.artist}
									</h1>
									<h1 class="text-sm font-light leading-none text-slate-400">
										{song.album}
									</h1>
								</div>
								<div class="ml-4 flex items-center">
									{#if isToggled(song)}
										<Check class="h-5 w-5 text-green-500" />
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</ScrollArea>
			</section>
			<Drawer.Footer>
				<div class="flex w-full items-center justify-between">
					<span class="text-sm text-muted-foreground">
						{addedSongs.length} track{addedSongs.length === 1 ? '' : 's'} selected
					</span>
					<div class="flex gap-2">
						<Drawer.Close asChild let:builder>
							<Button builders={[builder]} variant="outline">Cancel</Button>
						</Drawer.Close>
						<Button on:click={() => submitSongs()}>Add Tracks</Button>
					</div>
				</div>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>

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
