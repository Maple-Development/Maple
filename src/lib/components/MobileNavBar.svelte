<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { Music,
		DiscAlbum,
		ListMusic,
		SquareUser,
		Home,
		Settings,
		CirclePlus } from 'lucide-svelte';
</script>


<div class="relative flex items-center justify-center">
    <div class="flex flex-col justify-center items-center">
        <Button
                class="my-1 py-2 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
                href="/"
            >
                <Home size={30} class="mr-2 text-foreground" />
        </Button>
        <h1 class="px-1 text-sm text-foreground font-semibold">Home</h1>
    </div>
    <div class="flex flex-col justify-center items-center">
        <Button
                class="my-1 py-2 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
                href="/tracks"
            >
                <Music size={30} class="mr-2 text-foreground" />
        </Button>
        <h1 class="px-1 text-sm text-foreground font-semibold">Tracks</h1>
    </div>
    <div class="flex flex-col justify-center items-center">
        <Button
                class="my-1 py-2 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
                href="/playlists"
            >
                <ListMusic size={30} class="mr-2 text-foreground" />
        </Button>
        <h1 class="px-1 text-sm text-foreground font-semibold">Playlists</h1>
    </div>
    <div class="flex flex-col justify-center items-center">
        <Button
                class="my-1 py-2 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
                href="/albums"
            >
                <DiscAlbum size={30} class="mr-2 text-foreground" />
        </Button>
        <h1 class="px-1 text-sm text-foreground font-semibold">Albums</h1>
    </div>
    <div class="flex flex-col justify-center items-center">
        <Button
                class="my-1 py-2 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
                href="/artists"
            >
                <SquareUser size={30} class="mr-2 text-foreground" />
        </Button>
        <h1 class="px-1 text-sm text-foreground font-semibold">Artists</h1>
    </div>
    <div class="flex flex-col justify-center items-center">
        <Button
                class="my-1 py-2 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
                href="/settings"
            >
                <Settings size={30} class="mr-2 text-foreground" />
        </Button>
        <h1 class="px-1 text-sm text-foreground font-semibold">Settings</h1>
    </div>
</div>