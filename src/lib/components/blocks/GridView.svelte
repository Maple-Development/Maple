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
	class="grid auto-rows-fr grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
>
	{#each items as track (track.id)}
		<div class="group relative flex flex-col items-start transition-all duration-200 hover:scale-[1.02]">
			{#await getImageUrl(track.image) then image}
				<ContextMenu
					type={'track'}
					on:delete={(e) => openAlert(track)}
					on:addTrackToPlaylist={(e) => addTrackToPlaylist(track, e.detail.playlist)}
				>
					<TrackWrapper className="w-full" {track} {tracks}>
						<Lazy height={208} {keep}>
							<img 
								class="h-44 w-44 rounded-lg object-cover shadow-lg transition-all duration-300 group-hover:shadow-xl md:h-52 md:w-52" 
								src={image} 
								alt={track.title} 
							/>
						</Lazy>
					</TrackWrapper>
				</ContextMenu>
				<div class="mt-3 flex w-full flex-col items-start space-y-1">
					<h1 class="line-clamp-1 w-full text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-lg">
						{track.title}
					</h1>
					<h1 class="line-clamp-1 w-full text-sm font-normal leading-tight text-muted-foreground md:text-base">
						{track.artist}
					</h1>
				</div>
			{:catch error}
				<div class="h-52 w-52 animate-pulse rounded-lg bg-muted"></div>
			{/await}
		</div>
	{/each}
</div>
