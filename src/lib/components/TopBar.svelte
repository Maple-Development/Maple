<script lang="ts">
	import {
		Music,
		PanelRightOpen,
		DiscAlbum,
		ListMusic,
		SquareUser,
		Search,
		AudioLines,
		Home,
		Settings,
		User as UserIcon
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { collapsed, SavedUser, title } from '$lib/store';
	import { onMount } from 'svelte';
	import { OPFS } from '$lib/opfs';
	import type { Song } from '$lib/types/song';
	import type { Album } from '$lib/types/album';
	import type { Artist } from '$lib/types/artist';
	import type { Playlist } from '$lib/types/playlist';
	import { page } from '$app/stores';
	import TrackWrapper from './TrackWrapper.svelte';

	let songs: Song[] = [];
	let albums: Album[] = [];
	let artists: Artist[] = [];
	let playlists: Playlist[] = [];
	let open = false;

	onMount(async () => {
		songs = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
		albums = (await OPFS.get().albums()).sort((a, b) =>
			a.name.toString().localeCompare(b.name.toString())
		);
		artists = (await OPFS.get().artists()).sort((a, b) => a.name.localeCompare(b.name));
		playlists = await OPFS.get().playlists();
	});
</script>

<div class="relative flex items-center justify-between">
	<div class="flex items-center">
		<Button
			class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
			on:click={() => ($collapsed = !$collapsed)}
		>
			<PanelRightOpen size={20} color="white" />
		</Button>
		<h1 class="ml-2 text-xl font-bold text-muted-foreground">{$title}</h1>
	</div>
	<div class="absolute left-1/2 -translate-x-1/2 transform">
		<Button
			on:click={() => (open = !open)}
			class="my-2 h-8 max-w-xs text-primary"
			variant="outline"
		>
			<Search size={20} color="white" />
			<span class="ml-2">Search</span>
		</Button>
	</div>
	<div>
		{#if $SavedUser && $SavedUser.pfp !== null && $SavedUser.pfp !== undefined}
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img
				src={$SavedUser.pfp}
				alt="Profile Picture"
				class="h-12 w-12 self-center rounded-[50%] p-1 mr-2"
			/>
		{:else}
			<UserIcon color="black" class="h-8 w-8 self-center rounded-[50%] p-2 bg-primary mr-2" />
		{/if}
	</div>
</div>

<Command.Dialog class="bg-background" bind:open loop>
	<Command.Input placeholder="Search for recent items, or type a page name." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Go To">
			<a class="pointer" href="/">
				<Command.Item>
					<Home class="mr-2 h-4 w-4" />
					<span>Home</span>
				</Command.Item>
			</a>
			<a class="pointer" href="/tracks">
				<Command.Item>
					<AudioLines class="mr-2 h-4 w-4" />
					<span>Tracks</span>
				</Command.Item>
			</a>
			<a class="pointer" href="/albums">
				<Command.Item>
					<DiscAlbum class="mr-2 h-4 w-4" />
					<span>Albums</span>
				</Command.Item>
			</a>
			<a class="pointer" href="/artists">
				<Command.Item>
					<SquareUser class="mr-2 h-4 w-4" />
					<span>Artists</span>
				</Command.Item>
			</a>
			<a class="pointer" href="/playlists">
				<Command.Item>
					<ListMusic class="mr-2 h-4 w-4" />
					<span>Playlists</span>
				</Command.Item>
			</a>
			<a class="pointer" href="/settings">
				<Command.Item>
					<Settings class="mr-2 h-4 w-4" />
					<span>Settings</span>
				</Command.Item>
			</a>
		</Command.Group>
		<Command.Separator />
		{#if $page.url.pathname == '/tracks'}
			<Command.Group heading="Tracks">
				{#each songs as track}
					<TrackWrapper className="" {track} tracks={songs}>
						<Command.Item>
							<DiscAlbum class="mr-2 h-4 w-4" />
							<span>{track.title.replace(/["\[\]]/g, '')}</span>
						</Command.Item>
					</TrackWrapper>
				{/each}
			</Command.Group>
			<Command.Separator />
		{/if}
		{#if $page.url.pathname == '/albums'}
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
		{/if}
		{#if $page.url.pathname == '/artists'}
			<Command.Group heading="Artists">
				{#each artists as artist}
					<a class="pointer" href={`/artist?artist=${artist.id}`}>
						<Command.Item>
							<SquareUser class="mr-2 h-4 w-4" />
							<span>{artist.name.replace(/["\[\]]/g, '')}</span>
						</Command.Item>
					</a>
				{/each}
			</Command.Group>
			<Command.Separator />
		{/if}
		{#if $page.url.pathname == '/playlists'}
			<Command.Group heading="Playlists">
				{#each playlists as playlist}
					<a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
						<Command.Item>
							<ListMusic class="mr-2 h-4 w-4" />
							<span>{playlist.name.replace(/["\[\]]/g, '')}</span>
						</Command.Item>
					</a>
				{/each}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
