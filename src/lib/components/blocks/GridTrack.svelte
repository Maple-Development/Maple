<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import type { Song } from '$lib/types/song';
	import { onMount } from 'svelte';
	import ContextMenu from '../ui/context-menu/context-menu.svelte';
	import TrackWrapper from '../TrackWrapper.svelte';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import { toast } from 'svelte-sonner';

	import { createEventDispatcher } from 'svelte';
	import type { Playlist } from '$lib/types/playlist';
	const dispatch = createEventDispatcher();

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		return URL.createObjectURL(blob);
	}

	async function addTrackToPlaylist(track: Song, playlist: Playlist) {
		if (track && playlist) {
			OPFS.track().addToPlaylist(track, playlist);
			toast.success(`Added ${track.title} to ${playlist.name}`);
		}
	}

	function openAlert(track: Song) {
		dispatch('delete', track);
	}

	export let track: Song;
	$: track = track;

	export let tracks: Song[] = [];
	$: tracks = tracks;
</script>

{#if track}
	<div class="flex flex-col items-start">
		{#await getImageUrl(track.image) then image}
			<ContextMenu
				type={'track'}
				on:delete={(e) => openAlert(track)}
				on:addTrackToPlaylist={(e) => addTrackToPlaylist(track, e.detail.playlist)}
			>
				<TrackWrapper className="" {track} {tracks}>
					<Lazy height={208} keep={true}>
						<img class="h-44 w-44 rounded-sm md:h-52 md:w-52" src={image} alt={track.title} />
					</Lazy>
				</TrackWrapper>
			</ContextMenu>
			<div class="mt-4 flex flex-col items-start">
				<h1 class="md:text-md p-0 text-lg font-bold leading-none text-foreground">{track.title}</h1>
				<h1 class="p-0 text-sm font-light leading-none text-slate-400 md:text-base">
					{track.artist}
				</h1>
			</div>
		{:catch error}
			<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
		{/await}
	</div>
{/if}
