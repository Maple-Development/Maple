<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import type { Album } from '$lib/types/album';
	import type { Song } from '$lib/types/song';
	import { ArrowUpAZ, ArrowDownZA, ListFilter, Pencil, List, Check, Trash } from 'lucide-svelte';
	import GridTrack from '$lib/components/blocks/GridTrack.svelte';
	import ListTrack from '$lib/components/blocks/ListTrack.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { page } from '$app/stores';
	import { context, title } from '$lib/store';
	//@ts-ignore
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { goto } from '$app/navigation';
	import type { Playlist } from '$lib/types/playlist';

	let albumName: string;
	let album: Album | undefined;
	let tracks: Song[] = [];
	let playlists: Playlist[] = [];
	let disks: number = 0;
	let alldisks: Song[][] = [];
	let listType = 'grid';
	let editModeOn = false;
	let changedName = '';
	let changedArtist = '';
	let changedYear = '';
	let imageFile: Blob | null = null;
	$: params = new URLSearchParams($page.url.search);
	$: {
		refresh(params.get('album') ?? '');
	}
	onMount(async () => {
		let params = new URLSearchParams(document.location.search);
		albumName = params.get('album') ?? '';
		album = await OPFS.get().album(albumName);
		await sortTracks();
		// sort disks
		const diskMap: { [disk: number]: Song[] } = {};
		for (const track of tracks) {
			const disk = track.disk ?? 1;
			if (!diskMap[disk]) {
				diskMap[disk] = [];
			}
			diskMap[disk].push(track);
		}
		alldisks = Object.values(diskMap).map((diskTracks) =>
			diskTracks.sort((a, b) => a.trackNumber - b.trackNumber)
		);

		disks = alldisks.length;
		tracks = alldisks.flat();

		title.set(album?.name ?? 'Unknown Album');

		changedName = album?.name?.toString() ?? '';
		changedArtist = album?.artist?.toString() ?? '';
		changedYear = album?.year?.toString() ?? '';
		playlists = await OPFS.get().playlists();

	});

	async function refresh(albumName: string) {
		album = await OPFS.get().album(albumName);
		await sortTracks();
		// sort disks
		const diskMap: { [disk: number]: Song[] } = {};
		for (const track of tracks) {
			const disk = track.disk ?? 1;
			if (!diskMap[disk]) {
				diskMap[disk] = [];
			}
			diskMap[disk].push(track);
		}
		alldisks = Object.values(diskMap).map((diskTracks) =>
			diskTracks.sort((a, b) => a.trackNumber - b.trackNumber)
		);

		disks = alldisks.length;
		tracks = alldisks.flat();

		title.set(album?.name ?? 'Unknown Album');

		changedName = album?.name?.toString() ?? '';
		changedArtist = album?.artist?.toString() ?? '';
		changedYear = album?.year?.toString() ?? '';
	}

	async function sortTracks() {
		if (album && album.tracks) {
			const newTracks: Song[] = [];
			for (const track of album.tracks) {
				const trackData = await OPFS.get().track(track as string);
				if (trackData) {
					newTracks.push(trackData);
				}
			}
			newTracks.sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
			tracks = newTracks; // trigger re-render
		}
	}

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		return URL.createObjectURL(blob);
	}

	let sort = 'track';
	let ascending = true;

	async function orderTracks(s: string) {
		sort = s;
		if (s === 'title') {
			tracks = tracks.sort((a, b) =>
				ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
			);
		} else if (s === 'duration') {
			tracks = tracks.sort((a, b) =>
				ascending ? a.duration - b.duration : b.duration - a.duration
			);
		} else if (s === 'track') {
			if (alldisks.length > 1) {
				alldisks = alldisks.reverse().map((diskTracks) => diskTracks.slice().reverse());
				tracks = alldisks.flat();
			} else {
				tracks = tracks.sort((a, b) =>
					ascending
						? (a.trackNumber ?? 0) - (b.trackNumber ?? 0)
						: (b.trackNumber ?? 0) - (a.trackNumber ?? 0)
				);
			}
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
		orderTracks(sort);
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

		if (!editModeOn && album) {
			const doImage = imageFile !== null;
			const modifiedAlbum: Album = {
				id: album.id,
				name: changedName.replace(/[&<>"']/g, (match) => `&#${match.charCodeAt(0)};`),
				artist: changedArtist.replace(/[&<>"']/g, (match) => `&#${match.charCodeAt(0)};`),
				year: parseInt(changedYear.replace(/[^\d]/g, ''), 10),
				image: doImage ? imageFile : album.image,
				genre: album.genre,
				tracks: album.tracks
			};
			OPFS.album().edit(modifiedAlbum);
			let newAlbum = await OPFS.get().album(modifiedAlbum.id.toString());
			album = newAlbum;
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

	function deleteAlbum() {
		if (album) {
			OPFS.album().delete(album);
			goto('/albums');
		} else {
			console.error('Album not found');
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
</script>

<div class="mt-4 flex h-fit justify-between rounded-md border-gray-600 p-5 px-10">
	<div class="flex flex-col md:flex-row">
		<div>
			{#await getImageUrl(album?.image) then image}
				{#if editModeOn}
					<input
						type="file"
						id="files"
						class="block w-full rounded-md border-2 border-gray-300 px-2 py-1 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200"
						accept="image/*"
						multiple
						on:change={(e) => handlePhotoChange(e)}
					/>
				{:else}
					<img
						class="h-44 w-44 rounded-sm md:h-64 md:w-64"
						src={image}
						alt={album?.name?.toString() ?? ''}
					/>
				{/if}
			{:catch error}
				<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
			{/await}
		</div>
		<div class="ml-2 mt-2 flex flex-col items-start md:ml-7 md:mt-0">
			<div class="flex flex-col items-start">
				{#if editModeOn}
					<h1
						bind:innerHTML={changedName}
						contenteditable="true"
						class="border-1 mb-1 rounded-sm border p-1 text-2xl font-bold leading-none text-foreground underline"
					>
						{album?.name}
					</h1>
					<h1
						bind:innerHTML={changedArtist}
						contenteditable="true"
						class="border-1 rounded-sm border p-1 text-lg font-light leading-none text-slate-400 underline"
					>
						{album?.artist}
					</h1>
				{:else}
					<h1 class="mb-1 text-2xl font-bold leading-none text-foreground">{album?.name}</h1>
					<h1 class="p text-lg font-light leading-none text-slate-400">{album?.artist}</h1>
				{/if}
			</div>
			<div class="mt-auto flex flex-row items-end justify-between">
				{#if editModeOn}
					<h1
						bind:innerHTML={changedYear}
						contenteditable="true"
						class="border-1 rounded-sm border p-1 text-lg font-light leading-none text-slate-400 underline"
					>
						{album?.year}
					</h1>
				{:else}
					<h1 class="text-lg font-light leading-none text-slate-400">{album?.year}</h1>
				{/if}
			</div>
		</div>
	</div>
	<div class="flex flex-row items-center">
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
						This action cannot be undone. This will NOT delete the tracks within the album, only the
						album itself.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action on:click={() => deleteAlbum()}>Continue</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</div>
</div>

<Separator class="mb-4 ml-2 mt-1 w-[95%] pr-20 md:ml-14"></Separator>
<div class="mx-4 mt-4 flex h-10 justify-center border-gray-600 px-5 md:justify-end">
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
					<DropdownMenu.RadioItem value="track" on:click={() => orderTracks('track')}
						>Track #</DropdownMenu.RadioItem
					>
					<DropdownMenu.RadioItem value="title" on:click={() => orderTracks('title')}
						>Title</DropdownMenu.RadioItem
					>
					<DropdownMenu.RadioItem value="duration" on:click={() => orderTracks('duration')}
						>Duration</DropdownMenu.RadioItem
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

{#if listType !== 'grid'}
	<div class="my-0 ml-0 flex flex-col gap-y-8 md:my-5 md:ml-16">
		{#if alldisks.length > 1 && sort === 'track'}
			{#each alldisks as disk, diskIndex}
				{#if diskIndex > 0}
					<div class="flex flex-col items-start">
						<Separator class="mb-4 mt-1 w-[95%] pr-20"></Separator>
					</div>
				{/if}
				<div
					class="my-5 ml-4 mr-2 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:ml-2 md:mr-0 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
				>
					{#each disk as track}
						<GridTrack {track} {tracks} on:delete={(e) => openAlert(track)} />
					{/each}
				</div>
			{/each}
		{:else}
			<div
				class="my-5 ml-4 mr-2 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:ml-2 md:mr-0 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
			>
				{#each tracks as track}
					<GridTrack {track} {tracks} on:delete={(e) => openAlert(track)} />
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="mx-0 mb-5 mt-2 flex flex-col md:mx-4">
		{#if alldisks.length > 1 && sort === 'track'}
			{#each alldisks as disk, diskIndex}
				{#if diskIndex > 0}
					<div class="ml-16 flex flex-col items-start">
						<Separator class="mb-4 mt-1 w-[95%] pr-20"></Separator>
					</div>
				{/if}
				<div class="mx-4 mb-5 mt-2 flex flex-col">
					{#each disk as track}
						<ListTrack {track} {tracks} {playlists} on:delete={(e) => openAlert(track)} />
					{/each}
				</div>
			{/each}
		{:else}
			<div class="mx-4 mb-5 mt-2 flex flex-col">
				{#each tracks as track}
					<ListTrack {track} {tracks} {playlists} on:delete={(e) => openAlert(track)} />
				{/each}
			</div>
		{/if}
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
