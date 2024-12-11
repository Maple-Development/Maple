<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import type { Playlist } from '$lib/types/playlist';
	import type { Song } from '$lib/types/song';
	import TrackWrapper from '$lib/components/TrackWrapper.svelte';
	import {
		ArrowUpAZ,
		ArrowDownZA,
		ListFilter,
		List,
		Check,
		Pencil,
		Trash,
		EllipsisVertical,
		Plus,
		X
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { context, title } from '$lib/store';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { page } from '$app/stores';
	//@ts-ignore
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { goto } from '$app/navigation';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import { toast } from 'svelte-sonner';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let playlistName: string;
	let playlist: Playlist | undefined;
	let tracks: Song[] = [];
	let playlists: Playlist[] = [];
	let songs: Song[] = [];
	let addedSongs: String[] = [];
	let listType = 'list';
	let editModeOn = false;
	let changedName = '';
	let changedDescription = '';
	let imageFile: Blob | null = null;
	$: params = new URLSearchParams($page.url.search);
	$: {
		refresh(params.get('playlist') ?? '');
	}
	onMount(async () => {
		songs = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		let params = new URLSearchParams(document.location.search);
		playlistName = params.get('playlist') ?? '';
		playlist = await OPFS.get().playlist(playlistName);
		console.log(playlist);
		sortTracks();
		if (playlist && playlist.name) {
			title.set(playlist.name);
		} else {
			title.set('Unknown playlist');
		}

		changedName = playlist?.name?.toString() ?? '';
		changedDescription = playlist?.description?.toString() ?? '';
		playlists = await OPFS.get().playlists();
	});

	async function refresh(playlistName: string) {
		playlist = undefined;
		playlist = await OPFS.get().playlist(playlistName);
		sortTracks();
		if (playlist && playlist.name) {
			title.set(playlist.name);
		} else {
			title.set('Unknown playlist');
		}

		changedName = playlist?.name?.toString() ?? '';
	}

	async function sortTracks() {
		if (playlist && playlist.tracks) {
			const newTracks: Song[] = [];
			for (const track of playlist.tracks) {
				const trackData = await OPFS.get().track(track as string);
				console.log(trackData);
				if (trackData) {
					newTracks.push(trackData);
				}
			}
			tracks = newTracks; // trigger re-render
			console.log(tracks);
		}
	}

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		if (blob && blob.size === 0) {
			return '';
		}
		return URL.createObjectURL(blob);
	}

	let sort = 'title';
	let ascending = true;

	async function sortplaylists(s: string) {
		sort = s;
		if (s === 'title') {
			tracks = tracks.sort((a, b) =>
				ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
			);
		}
		if ($context.length === tracks.length) {
			const contextIds = new Set($context.map((song) => song.id));
			const tracksIds = new Set(tracks.map((song) => song.id));
			if (
				[...contextIds].every((id) => tracksIds.has(id)) &&
				[...tracksIds].every((id) => contextIds.has(id))
			) {
				context.set(tracks);
			}
		}
	}

	function swapAscending() {
		ascending = !ascending;
		sortplaylists(sort);
	}

	function formatDuration(duration: number): string {
		const roundedDuration = Math.round(duration);
		const minutes = Math.floor(roundedDuration / 60);
		const seconds = roundedDuration % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function swapListType() {
		if (listType === 'list') {
			listType = 'grid';
		} else {
			listType = 'list';
		}
	}

	async function editMode() {
		editModeOn = !editModeOn;

		if (!editModeOn && playlist) {
			const doImage = imageFile !== null;
			const modifiedplaylist: Playlist = {
				id: playlist.id,
				name: changedName,
				description: changedDescription,
				image: doImage ? imageFile : playlist.image,
				tracks: playlist.tracks
			};
			OPFS.playlist().edit(modifiedplaylist);
			let newplaylist = await OPFS.get().playlist(modifiedplaylist.id.toString());
			playlist = newplaylist;
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

	function deletePlaylist() {
		if (playlist) {
			OPFS.playlist().delete(playlist);
			toast.success(`Deleted ${playlist.name}`);
			goto('/playlists');
		} else {
			console.error('Playlist not found');
		}
	}

	async function deleteTrack() {
		if (selectedSong) {
			OPFS.track().delete(selectedSong);
			tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
			sortTracks();
		} else {
			console.error('Track not found');
		}
	}

	let open = false;
	let selectedSong: Song | null = null;

	async function addTrackToPlaylist(track: Song, playlist: Playlist) {
		if (track && playlist) {
			OPFS.track().addToPlaylist(track, playlist);
			toast.success(`Added ${track.title} to ${playlist.name}`);
			refresh(playlistName);
		}
	}

	function openAlert(track: Song) {
		open = true;
		selectedSong = track;
	}

	async function remove(track: Song) {
		if (playlist) {
			const trackIndex = playlist?.tracks?.findIndex((t: String) => t === track.id);
			if (playlist && trackIndex !== undefined) {
				OPFS.playlist().remove(playlist, trackIndex);
				toast.success(`Removed ${track.title} from ${playlist.name}`);
				refresh(playlistName);
			}
		}
	}

	async function editRemove(track: Song, i: number) {
		if (playlist) {
			const trackIndex = playlist?.tracks?.findIndex((t: String) => t === track.id);
			if (playlist && trackIndex !== undefined) {
				OPFS.playlist().remove(playlist, trackIndex);
				toast.success(`Removed ${track.title} from ${playlist.name}`);
				playlist?.tracks?.splice(i, 1);
				tracks = tracks.filter((t) => t.id !== track.id);
			}
		}
	}

	let openAdd = false;

	function toggleSongSelection(song: Song) {
		const index = addedSongs.findIndex((s) => s === song.id);
		if (index === -1) {
			addedSongs = [...addedSongs, song.id];
			tracks = [...tracks, song];
		} else {
			addedSongs = addedSongs.filter((s) => s !== song.id);
			tracks = tracks.filter((s) => s.id !== song.id);
		}
		console.log(addedSongs);
	}

	$: isToggled = (song: Song) => addedSongs.includes(song.id);

	function submitSongs() {
		if (playlist) {
			let allTracks = [...(playlist.tracks ?? []), ...addedSongs];
			playlist.tracks = allTracks;
			openAdd = false;
		}
	}

	async function editModeOff() {
		editModeOn = false;
		openAdd = false;
		//remove addedSongs from tracks
		tracks = tracks.filter((t) => !addedSongs.includes(t.id));
		//remove addedSongs from playlist
		if (playlist) {
			playlist.tracks = playlist.tracks?.filter((t) => !addedSongs.includes(t));
		}
		addedSongs = [];
		refresh(playlistName);
	}
</script>

<div class="mt-4 flex h-fit justify-between rounded-md border-gray-600 p-5 px-10">
	<div class="flex">
		<div>
			{#await getImageUrl(playlist?.image) then image}
				{#if editModeOn}
					<input
						type="file"
						id="files"
						class="block w-full rounded-md border-2 border-gray-300 px-2 py-1 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200"
						accept="image/*"
						multiple
						on:change={(e) => handlePhotoChange(e)}
					/>
				{:else if image !== ''}
					<img class="h-64 w-64 rounded-sm" src={image} alt={playlist?.name?.toString() ?? ''} />
				{:else}
					<div class="h-52 w-52 animate-pulse rounded-[50%] bg-gray-500"></div>
				{/if}
			{:catch error}
				<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
			{/await}
		</div>
		<div class="ml-7 flex flex-col items-start">
			<div class="flex flex-col items-start">
				{#if editModeOn}
					<h1
						bind:innerHTML={changedName}
						contenteditable="true"
						class="border-1 mb-1 rounded-sm border p-1 text-2xl font-bold leading-none text-foreground underline"
					>
						{playlist?.name}
					</h1>
					<h1
						bind:innerHTML={changedDescription}
						contenteditable="true"
						class="border-1 mb-1 rounded-sm border p-1 text-base font-light leading-none text-slate-400 underline"
					>
						{playlist?.description}
					</h1>
				{:else}
					<h1 class="mb-1 text-2xl font-bold leading-none text-foreground">{playlist?.name}</h1>
					<h1 class="mb-1 text-base font-light leading-none text-slate-400">
						{playlist?.description}
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
		{#if editModeOn}
			<Button
				class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
				on:click={() => editModeOff()}
			>
				<X size={20} color="white" />
			</Button>
		{/if}
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				<Button class="my-1 ml-3 h-10 w-10 px-1" variant="destructive">
					<Trash size={20} color="white" />
				</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. This will NOT delete the tracks within the playlist, only
						the playlist itself.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action on:click={() => deletePlaylist()}>Continue</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</div>
</div>
<Separator class="mb-4 ml-14 mt-1 w-[95%] pr-20"></Separator>
<div class="mx-4 mt-4 flex h-10 justify-end border-gray-600 px-5">
	<div class="flex items-center">
		{#if ascending}
			<Button
				class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
				on:click={() => swapAscending()}
			>
				<ArrowUpAZ size={20} color="white" />
			</Button>
		{:else}
			<Button
				class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
				on:click={() => swapAscending()}
			>
				<ArrowDownZA size={20} color="white" />
			</Button>
		{/if}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button
					class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
					builders={[builder]}
				>
					<ListFilter size={20} color="white" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>Sort By</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.RadioGroup bind:value={sort}>
					<DropdownMenu.RadioItem value="title" on:click={() => sortplaylists('name')}
						>Name</DropdownMenu.RadioItem
					>
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<Button
			class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
			on:click={() => swapListType()}
		>
			<List size={20} color="white" />
		</Button>
	</div>
</div>

{#if !editModeOn}
	{#if listType !== 'list'}
		<div
			class="my-5 ml-16 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
		>
			{#each tracks as track}
				<div class="flex flex-col items-start">
					{#await getImageUrl(track.image) then image}
						<ContextMenu
							type={'playlistTrack'}
							on:remove={(e) => remove(track)}
							on:delete={(e) => openAlert(track)}
							on:addTrackToPlaylist={(e) => addTrackToPlaylist(track, e.detail.playlist)}
						>
							<TrackWrapper className="" {track} {tracks}>
								<Lazy keep={true}>
									<img class="h-52 w-52 rounded-sm" src={image} alt={track.title} />
								</Lazy>
							</TrackWrapper>
						</ContextMenu>
						<div class="flex flex-row items-start">
							<div class="mt-4 flex h-full flex-col items-start">
								<h1 class="mb-1 text-lg font-bold leading-none text-foreground">{track.title}</h1>
								<h1 class="p text-base font-light leading-none text-slate-400">{track.artist}</h1>
							</div>
						</div>
					{:catch error}
						<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
					{/await}
				</div>
			{/each}
		</div>
	{:else}
		<div class="mx-4 mb-5 mt-2 flex flex-col">
			{#each tracks as track}
				<div class="flex w-full">
					<TrackWrapper className="flex-grow" {track} {tracks}>
						<div class="flex w-full flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary">
							{#await getImageUrl(track.image) then image}
								<Lazy keep={true}>
									<img class="mr-4 h-24 w-24" src={image} alt={track.title} />
								</Lazy>
							{:catch error}
								<div class="mr-4 h-24 w-24 bg-gray-500"></div>
							{/await}
							<div class="flex flex-grow flex-col items-start">
								<h1 class="mb-1 text-lg font-bold leading-none text-foreground">{track.title}</h1>
								<h1 class="text-base font-light leading-none text-slate-400">{track.artist}</h1>
							</div>
							<div class="ml-4 flex flex-row items-center text-right">
								<div class="flex flex-col">
									<h1 class="text-base font-light leading-none text-slate-400">
										{formatDuration(track.duration)}
									</h1>
									<h1 class="text-base font-light leading-none text-slate-400">{track.album}</h1>
									<h1 class="text-base font-light leading-none text-slate-400">{track.year}</h1>
								</div>
							</div>
						</div>
					</TrackWrapper>
					<div class="ml-2 flex items-center">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button
									class="h-10 w-10 bg-transparent px-1 hover:bg-secondary"
									builders={[builder]}
								>
									<EllipsisVertical size={20} color="white" />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								class="w-56 border border-popover-foreground bg-primary-foreground"
							>
								<DropdownMenu.Label>Options</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.Item on:click={() => remove(track)}>Remove</DropdownMenu.Item>
								<DropdownMenu.Item on:click={() => openAlert(track)}>Delete</DropdownMenu.Item>
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger>
										<span>Add to Playlist</span>
									</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent side="left" class="bg-primary-foreground">
										{#if playlists.length > 0}
											{#each playlists as playlist}
												<DropdownMenu.Item on:click={() => addTrackToPlaylist(track, playlist)}>
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
	{/if}
{:else}
	<div class="mx-4 mb-5 mt-2 flex flex-col">
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-missing-attribute -->
		<a
			on:click={() => (openAdd = true)}
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
		{#each tracks as track, i}
			<div class="flex w-full flex-row items-center rounded-sm px-2 py-2">
				{#await getImageUrl(track.image) then image}
					<Lazy keep={true}>
						<img class="mr-4 h-24 w-24" src={image} alt={track.title} />
					</Lazy>
				{:catch error}
					<div class="mr-4 h-24 w-24 bg-gray-500"></div>
				{/await}
				<div class="flex flex-grow flex-col items-start">
					<h1 class="mb-1 text-lg font-bold leading-none text-foreground">{track.title}</h1>
					<h1 class="text-base font-light leading-none text-slate-400">{track.artist}</h1>
				</div>
				<div class="ml-4 flex flex-row items-center text-right">
					<div class="flex flex-col">
						<h1 class="text-base font-light leading-none text-slate-400">
							{formatDuration(track.duration)}
						</h1>
						<h1 class="text-base font-light leading-none text-slate-400">{track.album}</h1>
						<h1 class="text-base font-light leading-none text-slate-400">{track.year}</h1>
					</div>
				</div>
				<div class="ml-2 flex items-center">
					<Button
						class="my-1 ml-3 h-10 w-10 px-1"
						variant="destructive"
						on:click={() => editRemove(track, i)}
					>
						<Trash size={20} color="white" />
					</Button>
				</div>
			</div>
		{/each}
	</div>

	<Drawer.Root bind:open={openAdd}>
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
												<Lazy keep={true}>
													<img
														class="mr-4 h-24 w-24 border-2 border-green-400"
														src={image}
														alt={song.title}
													/>
												</Lazy>
											{:else}
												<Lazy keep={true}>
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

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger></AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will COMPLETELY delete the track, and remove it from any
				playlists, albums or artist pages.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={() => deleteTrack()}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
