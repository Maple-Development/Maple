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
	<div class="flex w-full">
		<TrackWrapper className="flex-grow" {track} {tracks}>
			<div class="flex w-full flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary">
				<div class="h-12 w-12 flex-shrink-0 md:h-24 md:w-24">
					{#await getImageUrl(track.image) then image}
						<Lazy height={208} {keep}>
							<img class="rounded-md" src={image} alt={track.title} />
						</Lazy>
					{:catch error}
						<div class="h-24 w-24 rounded-full bg-gray-500"></div>
					{/await}
				</div>
				<div class="ml-4 flex flex-col">
					<h1 class="text-lg font-bold leading-none text-foreground">{track.title}</h1>
					<h1 class="text-base font-light leading-none text-slate-400">{track.artist}</h1>
				</div>
				{#if !$isSmallDevice}
					<div class="ml-4 flex flex-grow flex-row items-center justify-end text-right">
						<div class="flex flex-col">
							<h1 class="text-base font-light leading-none text-slate-400">
								{formatDuration(track.duration)}
							</h1>
							<h1 class="text-base font-light leading-none text-slate-400">{track.album}</h1>
							<h1 class="text-base font-light leading-none text-slate-400">{track.year}</h1>
						</div>
					</div>
				{/if}
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
{/if}
