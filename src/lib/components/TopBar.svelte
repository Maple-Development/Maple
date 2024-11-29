<script lang="ts">
	import {
		Music,
		PanelRightOpen,
		DiscAlbum,
		ListMusic,
		SquareUser,
		Search
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { collapsed } from '$lib/store';
	import { onMount } from 'svelte';
	import { OPFS } from '$lib/opfs';
    import type { Song } from "$lib/types/song";
	import type { Album } from "$lib/types/album";
	import type { Artist } from "$lib/types/artist";
	import type { Playlist } from "$lib/types/playlist";
	import TrackWrapper from './TrackWrapper.svelte';
	
	let songs: Song[] = [];
	let albums: Album[] = [];
	let artists: Artist[] = [];
	let playlists: Playlist[] = [];
	let open = false;

	onMount(async () => {
		songs = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		albums = (await OPFS.get().albums()).sort((a, b) => a.name.toString().localeCompare(b.name.toString()));
		artists = (await OPFS.get().artists()).sort((a, b) => a.name.localeCompare(b.name));
		playlists = await OPFS.get().playlists();
	});
</script>

<div class="flex justify-between">
	<div class="flex">
		<Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => ($collapsed = !$collapsed)}
			><PanelRightOpen size={20} color="white" /></Button
		>
	</div>
	<div class="flex flex-grow justify-center mr-14">
		<Button
			on:click={() => (open = !open)}
			class="my-2 h-8 max-w-xs text-primary"
			variant="outline"
		>
			<Search size={20} color="white" />
			<span class="ml-2">Search</span>
		</Button>
	</div>
</div>

<Command.Dialog class="bg-background" bind:open loop>
	<Command.Input placeholder="Search for recent items, or type a page name." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Recent items">
			<Command.Item>
				<SquareUser class="mr-2 h-4 w-4" />
				<span>Nirvana</span>
			</Command.Item>
			<Command.Item>
				<SquareUser class="mr-2 h-4 w-4" />
				<span>Kendrick Lamar</span>
			</Command.Item>
			<Command.Item>
				<DiscAlbum class="mr-2 h-4 w-4" />
				<span>Damn.</span>
			</Command.Item>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Tracks">
			{#each songs as track}
				<TrackWrapper {track} tracks={songs}>
				<Command.Item>
					<DiscAlbum class="mr-2 h-4 w-4" />
					<span>{track.title.replace(/["\[\]]/g, '')}</span>
				</Command.Item>
				</TrackWrapper>
			{/each}
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Albums">
			{#each albums as album}
			<a class="pointer" href={`/album?album=${album.id}`}>
				<Command.Item>
					<DiscAlbum class="mr-2 h-4 w-4" />
					<span>{album.name.replace(/["\[\]]/g, '')}</span>
				</Command.Item>
			</a>
			{/each}
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Artists">
			{#each artists as artist}
				<Command.Item>
					<SquareUser class="mr-2 h-4 w-4" />
					<span>{artist.name.replace(/["\[\]]/g, '')}</span>
				</Command.Item>
			{/each}
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Playlists">
			{#each playlists as playlist}
				<Command.Item>
					<ListMusic class="mr-2 h-4 w-4" />
					<span>{playlist.name.replace(/["\[\]]/g, '')}</span>
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
