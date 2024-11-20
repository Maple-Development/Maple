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
<div class="sm:flex sm:flex-col sm:items-center justify-between md:w-full w-full ml-3 h-full">
	<div class="sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full w-full">
	<Button class="my-1 w-10/12 flex flex-row items-center justify-start bg-transparent px-1 hover:bg-secondary" href="/">
		<Home size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Home</h1>
		{/if}
	</Button>
	<Button class="my-1 w-10/12 flex flex-row items-center justify-start bg-transparent px-1 hover:bg-secondary" href="/tracks">
		<Music size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Tracks</h1>
		{/if}
	</Button>
	<Button class="my-1 w-10/12 flex flex-row items-center justify-start bg-transparent px-1 hover:bg-secondary">
		<ListMusic size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Playlists</h1>
		{/if}
	</Button>
	<Button class="my-1 w-10/12 flex flex-row items-center justify-start bg-transparent px-1 hover:bg-secondary">
		<DiscAlbum size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Albums</h1>
		{/if}
	</Button>
	<Button class="my-1 w-10/12 flex flex-row items-center justify-start bg-transparent px-1 hover:bg-secondary">
		<SquareUser size={20} class="text-foreground mr-2" />
		{#if $collapsed}
		<h1 class="text-foreground px-1 md:block hidden">Artists</h1>
		{/if}
	</Button>
	</div>
	<div class="sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full w-full">
	<Button class="my-1 w-10/12 flex flex-row items-center justify-start bg-transparent px-1 hover:bg-secondary">
		<CirclePlus size={20} class="text-foreground mr-2" />
		{#if $collapsed}
			<h1 class="text-foreground px-1 md:block hidden text-xs">New Playlist</h1>
		{/if}
	</Button>
	<Button class="my-1 w-10/12 flex flex-row items-center justify-start bg-transparent px-1 hover:bg-secondary">
		<Settings size={20} class="text-foreground mr-2" />
		{#if $collapsed}
			<h1 class="text-foreground px-1 md:block hidden">Settings</h1>
		{/if}
	</Button>
	</div>
</div>

