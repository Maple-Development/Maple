<script lang="ts">
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import TrackWrapper from '$lib/components/TrackWrapper.svelte';
	import { OPFS } from '$lib/opfs';
	import type { Song } from '$lib/types/song';
	import type { Album } from '$lib/types/album';
	import type { Playlist } from '$lib/types/playlist';
	import type { Artist } from '$lib/types/artist';
	import { toast } from 'svelte-sonner';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import { onMount } from 'svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		return URL.createObjectURL(blob);
	}

	export let songs: Song[] = [];
	export let albums: Album[] = [];
	export let artists: Artist[] = [];
	export let playlists: Playlist[] = [];
	export let tracks: Song[] = [];
	export let keep: boolean = true;	
	$: keep = keep;

	let items = songs || albums || artists || playlists;

	$: items = songs || albums || artists || playlists;

	async function addTrackToPlaylist(track: Song, playlist: Playlist) {
		if (track && playlist) {
			OPFS.track().addToPlaylist(track, playlist);
			toast.success(`Added ${track.title} to ${playlist.name}`);
		}
	}

	function openAlert(track: Song) {
		dispatch('delete', track);
	}
</script>

<div
	class="my-5 ml-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:ml-16 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
>
	{#each items as track (track.id)}
		<div class="mr-2 flex flex-col items-start">
			{#await getImageUrl(track.image) then image}
				<ContextMenu
					type={'track'}
					on:delete={(e) => openAlert(track)}
					on:addTrackToPlaylist={(e) => addTrackToPlaylist(track, e.detail.playlist)}
				>
					<TrackWrapper className="" {track} {tracks}>
						<Lazy height={208} keep={keep}>
							<img class="h-44 w-44 rounded-sm md:h-52 md:w-52" src={image} alt={track.title} />
						</Lazy>
					</TrackWrapper>
				</ContextMenu>
				<div class="flex flex-row items-start">
					<div class="mt-4 flex h-full flex-col items-start">
						<h1 class="md:text-md p-0 text-lg font-bold leading-none text-foreground">
							{track.title}
						</h1>
						<h1 class="p-0 text-sm font-light leading-none text-slate-400 md:text-base">
							{track.artist}
						</h1>
					</div>
				</div>
			{:catch error}
				<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
			{/await}
		</div>
	{/each}
</div>
