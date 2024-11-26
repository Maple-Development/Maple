<script lang="ts">
    //@ts-nocheck
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Artist } from "$lib/types/artist";


    let artists: Artist[] = [];

    onMount(async () => {
        artists = await OPFS.get().artists();
    });

   async function getImageUrl(imagePath: string): Promise<string> {
     const response = await OPFS.get().image(imagePath);
     const arrayBuffer = await response.arrayBuffer();
     const blob = new Blob([arrayBuffer]);
     console.log(blob);
     return URL.createObjectURL(blob);
   }
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 mx-5 my-5">
    {#each artists as artist}
        <div class="flex flex-col items-start">
            {#await getImageUrl(artist.image) then image}
            <div class="h-52 w-52 bg-gray-500 rounded-[50%] animate-pulse"></div>
            <div class="flex flex-row items-start">
                <div class="flex flex-col items-start h-full mt-4">
                    <h1 class="text-foreground text-lg font-bold leading-none mb-1">{artist.name}</h1>
                </div>
            </div>
            {:catch error}
            <div class="h-52 w-52 bg-gray-500 rounded-sm animate-pulse"></div>
            {/await}
        </div>
    {/each}
    </div>