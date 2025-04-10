<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import type { Song } from '$lib/types/song';
	import { onMount } from 'svelte';
	import ContextMenu from '../ui/context-menu/context-menu.svelte';
	import TrackWrapper from '../TrackWrapper.svelte';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import { toast } from 'svelte-sonner';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { isSmallDevice } from '$lib/store';
	import Button from '../ui/button/button.svelte';
	import { EllipsisVertical } from 'lucide-svelte';

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

	export let playlists: Playlist[] = [];
	$: playlists = playlists;

	export let keep: boolean = true;
	$: keep = keep;

	function formatDuration(duration: number): string {
		const roundedDuration = Math.round(duration);
		const minutes = Math.floor(roundedDuration / 60);
		const seconds = roundedDuration % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

{#if track}
	<div class="group flex w-full items-center rounded-lg p-2 transition-colors hover:bg-secondary/50">
		<TrackWrapper className="flex-grow" {track} {tracks}>
			<div class="flex w-full items-center gap-4">
				<div class="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md md:h-16 md:w-16">
					{#await getImageUrl(track.image) then image}
						<Lazy height={64} {keep}>
							<img 
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
								src={image} 
								alt={track.title} 
							/>
						</Lazy>
					{:catch error}
						<div class="h-full w-full animate-pulse rounded-md bg-muted"></div>
					{/await}
				</div>
				<div class="flex min-w-0 flex-1 flex-col">
					<h1 class="line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
						{track.title}
					</h1>
					<h1 class="line-clamp-1 text-sm text-muted-foreground">
						{track.artist}
					</h1>
				</div>
				{#if !$isSmallDevice}
					<div class="hidden flex-1 items-center justify-end gap-6 text-right md:flex">
						<div class="flex items-center gap-4 text-xs text-muted-foreground/70">
							<span>{formatDuration(track.duration)}</span>
							<span class="text-muted-foreground/50">•</span>
							<span>{track.album}</span>
							<span class="text-muted-foreground/50">•</span>
							<span>{track.year}</span>
						</div>
					</div>
				{/if}
			</div>
		</TrackWrapper>
		<div class="ml-2 flex items-center">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button 
						class="h-8 w-8 bg-transparent p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-secondary" 
						builders={[builder]}
					>
						<EllipsisVertical size={18} class="text-muted-foreground" />
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
{/if}
