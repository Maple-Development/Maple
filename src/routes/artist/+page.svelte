<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import type { Artist } from '$lib/types/artist';
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
		EllipsisVertical
	} from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { context, title } from '$lib/store';
	import { Separator } from '$lib/components/ui/separator/index.js';
	//@ts-ignore
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import { toast } from 'svelte-sonner';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import type { Playlist } from '$lib/types/playlist';

	let artistName: string;
	let artist: Artist | undefined;
	let tracks: Song[] = [];
	let playlists: Playlist[] = [];
	let listType = 'list';
	let editModeOn = false;
	let changedName = '';
	let imageFile: Blob | null = null;
	$: params = new URLSearchParams($page.url.search);
	$: {
		refresh(params.get('artist') ?? '');
	}
	onMount(async () => {
		let params = new URLSearchParams(document.location.search);
		artistName = params.get('artist') ?? '';
		artist = await OPFS.get().artist(artistName);
		playlists = await OPFS.get().playlists();
		sortTracks();
		if (artist && artist.name) {
			title.set(artist.name);
		} else {
			title.set('Unknown Artist');
		}

		changedName = artist?.name?.toString() ?? '';
	});

	async function refresh(artistName: string) {
		artist = await OPFS.get().artist(artistName);
		sortTracks();
		if (artist && artist.name) {
			title.set(artist.name);
		} else {
			title.set('Unknown Artist');
		}

		changedName = artist?.name?.toString() ?? '';
	}

	async function sortTracks() {
		if (artist && artist.tracks) {
			const newTracks: Song[] = [];
			for (const track of artist.tracks) {
				const trackData = await OPFS.get().track(track as string);
				if (trackData) {
					newTracks.push(trackData);
				}
			}
			tracks = newTracks; // trigger re-render
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

	async function sortArtists(s: string) {
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
		sortArtists(sort);
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

		if (!editModeOn && artist) {
			const doImage = imageFile !== null;
			const modifiedartist: Artist = {
				id: artist.id,
				name: changedName,
				image: doImage ? imageFile : artist.image,
				tracks: artist.tracks,
				albums: artist.albums
			};
			OPFS.artist().edit(modifiedartist);
			let newartist = await OPFS.get().artist(modifiedartist.id.toString());
			artist = newartist;
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

	function deleteArtist() {
		if (artist) {
			OPFS.artist().delete(artist);
			toast.success(`Deleted ${artist.name} from library`);
			goto('/artists');
		} else {
			console.error('Artist not found');
		}
	}

	let open = false;
	let selectedSong: Song | null = null;

	function openAlert(track: Song) {
		open = true;
		selectedSong = track;
	}

	async function deleteTrack() {
		if (selectedSong) {
			OPFS.track().delete(selectedSong);
			tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
			sortTracks();
		} else {
			console.error('Album not found');
		}
	}

	async function addTrackToPlaylist(track: Song, playlist: Playlist) {
		if (track && playlist) {
			OPFS.track().addToPlaylist(track, playlist);
			toast.success(`Added ${track.title} to ${playlist.name}`);
		}
	}
</script>

<div class="mt-4 flex h-fit justify-between rounded-md border-gray-600 p-5 px-10">
	<div class="flex">
		<div>
			{#await getImageUrl(artist?.image) then image}
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
					<img class="h-64 w-64 rounded-sm" src={image} alt={artist?.name?.toString() ?? ''} />
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
						{artist?.name}
					</h1>
				{:else}
					<h1 class="mb-1 text-2xl font-bold leading-none text-foreground">{artist?.name}</h1>
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
						This action cannot be undone. This will NOT delete the artist's tracks, only the artist
						page itself.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action on:click={() => deleteArtist()}>Continue</AlertDialog.Action>
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
					<DropdownMenu.RadioItem value="title" on:click={() => sortArtists('name')}
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

{#if listType !== 'list'}
	<div
		class="my-5 ml-16 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
	>
		{#each tracks as track}
			<div class="flex flex-col items-start">
				{#await getImageUrl(track.image) then image}
					<ContextMenu
						type={'track'}
						on:delete={(e) => openAlert(track)}
						on:addTrackToPlaylist={(e) => addTrackToPlaylist(track, e.detail.playlist)}
					>
						<TrackWrapper className="" {track} {tracks}>
							<Lazy height={208} keep={true}>
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
							<Button class="h-10 w-10 bg-transparent px-1 hover:bg-secondary" builders={[builder]}>
								<EllipsisVertical size={20} color="white" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Label>Options</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item on:click={() => openAlert(track)}>Delete</DropdownMenu.Item>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>
									<span>Add to Playlist</span>
								</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent side="left">
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
