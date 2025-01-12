<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Music,
		DiscAlbum,
		ListMusic,
		SquareUser,
		Home,
		Settings,
		CirclePlus
	} from 'lucide-svelte';
</script>

<div class="relative flex items-center justify-center">
	<div class="flex flex-col items-center justify-center">
		<Button
			class="my-1 flex w-fit flex-row items-center justify-start bg-transparent py-2 pl-4 pr-2 hover:bg-secondary"
			href="/"
		>
			<Home size={30} class="mr-2 text-foreground" />
		</Button>
		<h1 class="px-1 text-sm font-semibold text-foreground">Home</h1>
	</div>
	<div class="flex flex-col items-center justify-center">
		<Button
			class="my-1 flex w-fit flex-row items-center justify-start bg-transparent py-2 pl-4 pr-2 hover:bg-secondary"
			href="/tracks"
		>
			<Music size={30} class="mr-2 text-foreground" />
		</Button>
		<h1 class="px-1 text-sm font-semibold text-foreground">Tracks</h1>
	</div>
	<div class="flex flex-col items-center justify-center">
		<Button
			class="my-1 flex w-fit flex-row items-center justify-start bg-transparent py-2 pl-4 pr-2 hover:bg-secondary"
			href="/playlists"
		>
			<ListMusic size={30} class="mr-2 text-foreground" />
		</Button>
		<h1 class="px-1 text-sm font-semibold text-foreground">Playlists</h1>
	</div>
	<div class="flex flex-col items-center justify-center">
		<Button
			class="my-1 flex w-fit flex-row items-center justify-start bg-transparent py-2 pl-4 pr-2 hover:bg-secondary"
			href="/albums"
		>
			<DiscAlbum size={30} class="mr-2 text-foreground" />
		</Button>
		<h1 class="px-1 text-sm font-semibold text-foreground">Albums</h1>
	</div>
	<div class="flex flex-col items-center justify-center">
		<Button
			class="my-1 flex w-fit flex-row items-center justify-start bg-transparent py-2 pl-4 pr-2 hover:bg-secondary"
			href="/artists"
		>
			<SquareUser size={30} class="mr-2 text-foreground" />
		</Button>
		<h1 class="px-1 text-sm font-semibold text-foreground">Artists</h1>
	</div>
	<div class="flex flex-col items-center justify-center">
		<Button
			class="my-1 flex w-fit flex-row items-center justify-start bg-transparent py-2 pl-4 pr-2 hover:bg-secondary"
			href="/settings"
		>
			<Settings size={30} class="mr-2 text-foreground" />
		</Button>
		<h1 class="px-1 text-sm font-semibold text-foreground">Settings</h1>
	</div>
</div>
