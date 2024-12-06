<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import type { Song } from '$lib/types/song';
	import type { Playlist } from '$lib/types/playlist';
	import { ArrowUpAZ, ArrowDownZA, ListFilter, List, EllipsisVertical, X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import TrackWrapper from '$lib/components/TrackWrapper.svelte';
	import { context, title } from '$lib/store';
	import { toast } from 'svelte-sonner';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	// @ts-ignore
	import Lazy from 'svelte-lazy';

	let tracks: Song[] = [];
	let playlists: Playlist[] = [];

	onMount(async () => {
		tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		playlists = await OPFS.get().playlists();
		title.set('Tracks');
	});

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		return URL.createObjectURL(blob);
	}

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

	async function addTrackToPlaylist(track: Song, playlist: Playlist) {
		if (track && playlist) {
			OPFS.track().addToPlaylist(track, playlist);
			toast.success(`Added ${track.title} to ${playlist.name}`);
		}
	}

	let openContextMenu = false;
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
			sortTracks(sort);
			toast.success(`Deleted ${selectedSong.title} from library`);
		} else {
			console.error('Album not found');
		}
	}
</script>

<div class="mt-4 flex h-10 w-full justify-end px-10">
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
	<div
		class="my-5 ml-16 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
	>
		{#each tracks as track (track.id)}
			<div class="flex flex-col items-start">
				{#await getImageUrl(track.image) then image}
					<ContextMenu
						type={'track'}
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
