<script lang="ts">
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Song } from "$lib/types/song";
    import { ArrowUpAZ, ArrowDownZA } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { fade } from 'svelte/transition'; // Import the flip transition

    let tracks: Song[] = [];

    onMount(async () => {
        tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
    });

    async function getImageUrl(imagePath: string): Promise<string> {
        const response = await OPFS.get().image(imagePath);
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer]);
        console.log(blob);
        return URL.createObjectURL(blob);
    }

    let atoZ = true;

    async function sortTracks(a: boolean) {
        if (a) {
            tracks = tracks.sort((a, b) => a.title.localeCompare(b.title));
            atoZ = true;
        } else {
            tracks = tracks.sort((a, b) => b.title.localeCompare(a.title));
            atoZ = false;
        }
    }
</script>

<div class="w-full mt-4 h-10 px-10 flex justify-end">
    {#if atoZ}
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => sortTracks(false)}>
            <ArrowUpAZ size={20} color="white" />
        </Button>
    {:else}
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => sortTracks(true)}>
            <ArrowDownZA size={20} color="white" />
        </Button>
    {/if}
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 ml-16 my-5">
    {#each tracks as track (track.id)}
        <div class="flex flex-col items-start">
            {#await getImageUrl(track.image) then image}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a on:click={() => OPFS.play(track)}>
                <img class="h-52 w-52 rounded-sm" src={image} alt={track.title} />
            </a>
                <div class="flex flex-row items-start">
                    <div class="flex flex-col items-start h-full mt-4">
                        <h1 class="text-foreground text-lg font-bold leading-none mb-1">{track.title}</h1>
                        <h1 class="text-slate-400 text-base font-light leading-none p">{track.artist}</h1>
                    </div>
                </div>
            {:catch error}
                <div class="h-52 w-52 bg-gray-500 rounded-sm animate-pulse"></div>
            {/await}
        </div>
    {/each}
</div>