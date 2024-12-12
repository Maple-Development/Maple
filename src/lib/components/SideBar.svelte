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

<div class="ml-2 h-full w-full justify-between sm:flex sm:flex-col sm:items-center md:w-full">
	<div class="w-full sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full">
		<Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/"
		>
			<Home size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Home</h1>
			{/if}
		</Button>
		<Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/tracks"
		>
			<Music size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Tracks</h1>
			{/if}
		</Button>
		<Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/playlists"
		>
			<ListMusic size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Playlists</h1>
			{/if}
		</Button>
		<Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/albums"
		>
			<DiscAlbum size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Albums</h1>
			{/if}
		</Button>
		<Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/artists"
		>
			<SquareUser size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Artists</h1>
			{/if}
		</Button>
	</div>
	<div class="w-full sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full">
		<Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/playlists?create=true"
		>
			<CirclePlus size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-xs text-foreground md:block">New Playlist</h1>
			{/if}
		</Button>
		<Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/settings"
		>
			<Settings size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Settings</h1>
			{/if}
		</Button>
	</div>
</div>
