<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import type { Song } from '$lib/types/song';
	import type { Playlist } from '$lib/types/playlist';
	import { ArrowUpAZ, ArrowDownZA, ListFilter, List } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { context, title } from '$lib/store';
	import { toast } from 'svelte-sonner';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import GridView from '$lib/components/blocks/GridView.svelte';
	import ListTrack from '$lib/components/blocks/ListTrack.svelte';

	let tracks: Song[] = [];
	let playlists: Playlist[] = [];

	onMount(async () => {
		tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		playlists = await OPFS.get().playlists();
		title.set('Tracks');
	});

	let sort = 'title';
	let ascending = true;
	let listType = 'grid';

	async function sortTracks(s: string) {
		sort = s;
		if (s === 'title') {
			tracks = tracks.sort((a, b) =>
				ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
			);
		} else if (s === 'artist') {
			tracks = tracks.sort((a, b) =>
				ascending ? a.artist.localeCompare(b.artist) : b.artist.localeCompare(a.artist)
			);
		} else if (s === 'album') {
			tracks = tracks.sort((a, b) =>
				ascending ? a.album.localeCompare(b.album) : b.album.localeCompare(a.album)
			);
		} else if (s === 'year') {
			tracks = tracks.sort((a, b) => (ascending ? a.year - b.year : b.year - a.year));
		} else if (s === 'duration') {
			tracks = tracks.sort((a, b) =>
				ascending ? a.duration - b.duration : b.duration - a.duration
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
		sortTracks(sort);
	}

	function swapListType() {
		if (listType === 'list') {
			listType = 'grid';
		} else {
			listType = 'list';
		}
	}

	let open = false;
	let selectedSong: Song | null = null;

	function openAlert(e: {
		id?: string;
		title?: string;
		artist?: string;
		album?: string;
		year?: number;
		genre?: string | undefined;
		fileName?: string;
		duration?: number;
		image?: any;
		trackNumber?: number;
		disk?: number;
		ext?: string;
		detail?: any;
	}) {
		open = true;
		selectedSong = e.detail;
		console.log('work');
	}

	async function deleteTrack() {
		if (selectedSong) {
			OPFS.track().delete(selectedSong);
			tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
			sortTracks(sort);
			toast.success(`Deleted ${selectedSong.title} from library`);
		} else {
			console.error('Album not found');
		}
	}

	function dokeep() {
		if (tracks.length > 100) {
			return false;
		} else {
			return true;
		}
	}
</script>

<div class="mt-4 flex h-10 w-full justify-center px-10 md:justify-end">
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
				<DropdownMenu.RadioItem value="title" on:click={() => sortTracks('title')}
					>Title</DropdownMenu.RadioItem
				>
				<DropdownMenu.RadioItem value="artist" on:click={() => sortTracks('artist')}
					>Artist</DropdownMenu.RadioItem
				>
				<DropdownMenu.RadioItem value="album" on:click={() => sortTracks('album')}
					>Album</DropdownMenu.RadioItem
				>
				<DropdownMenu.RadioItem value="year" on:click={() => sortTracks('year')}
					>Year</DropdownMenu.RadioItem
				>
				<DropdownMenu.RadioItem value="duration" on:click={() => sortTracks('duration')}
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

{#if listType === 'grid'}
	<GridView keep={dokeep()} {tracks} songs={tracks} on:delete={openAlert} />
{:else}
	<div class="mx-4 mb-5 mt-2 flex flex-col">
		{#each tracks as track}
			<ListTrack keep={dokeep()} {track} {tracks} {playlists} on:delete={(e) => openAlert(track)} />
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
