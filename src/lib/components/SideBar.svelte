<script lang="ts">
	import {
		Music,
		DiscAlbum,
		ListMusic,
		SquareUser,
		Home,
		Settings,
		CirclePlus
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { collapsed } from '$lib/store';
</script>
<div class="sm:flex sm:flex-col sm:items-center justify-between md:w-full w-full ml-2 h-full">
	<div class="sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full w-full">
	<Button class="my-1 w-fit flex flex-row items-center justify-start bg-transparent pr-2 pl-4 mr-5 hover:bg-secondary" href="/">
		<Home size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Home</h1>
		{/if}
	</Button>
	<Button class="my-1 w-fit flex flex-row items-center justify-start bg-transparent pr-2 pl-4 mr-5 hover:bg-secondary" href="/tracks">
		<Music size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Tracks</h1>
		{/if}
	</Button>
	<Button class="my-1 w-fit flex flex-row items-center justify-start bg-transparent pr-2 pl-4 mr-5 hover:bg-secondary" href="/playlists">
		<ListMusic size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Playlists</h1>
		{/if}
	</Button>
	<Button class="my-1 w-fit flex flex-row items-center justify-start bg-transparent pr-2 pl-4 mr-5 hover:bg-secondary" href="/albums">
		<DiscAlbum size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Albums</h1>
		{/if}
	</Button>
	<Button class="my-1 w-fit flex flex-row items-center justify-start bg-transparent pr-2 pl-4 mr-5 hover:bg-secondary" href="/artists">
		<SquareUser size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Artists</h1>
		{/if}
	</Button>
	</div>
	<div class="sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full w-full">
	<Button class="my-1 w-fit flex flex-row items-center justify-start bg-transparent pr-2 pl-4 mr-5 hover:bg-secondary" href="/playlists?create=true">
		<CirclePlus size={20} class="text-foreground mr-2" />
		{#if $collapsed}
			<h1 class="text-foreground px-1 md:block hidden text-xs">New Playlist</h1>
		{/if}
	</Button>
	<Button class="my-1 w-fit flex flex-row items-center justify-start bg-transparent pr-2 pl-4 mr-5 hover:bg-secondary" href="/settings">
		<Settings size={20} class="text-foreground mr-2" />
		{#if $collapsed}
			<h1 class="text-foreground px-1 md:block hidden">Settings</h1>
		{/if}
	</Button>
	</div>
</div>

