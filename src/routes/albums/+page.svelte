<script lang="ts">
    //@ts-nocheck
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Album } from "$lib/types/album";


    let albums: Album[] = [];

    onMount(async () => {
        albums = await OPFS.get().albums();
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
    {#each albums as album}
        <div class="flex flex-col items-start">
            {#await getImageUrl(album.image) then image}
                <img class="h-52 w-52 rounded-sm" src={image} alt={album.name} />
            <div class="flex flex-row items-start">
                <div class="flex flex-col items-start h-full mt-4">
                    <h1 class="text-foreground text-lg font-bold leading-none mb-1">{album.name}</h1>
                    <h1 class="text-slate-400 text-base font-light leading-none p">{album.artist}</h1>
                </div>
            </div>
            {:catch error}
            <div class="h-52 w-52 bg-gray-500 rounded-sm animate-pulse"></div>
            {/await}
        </div>
    {/each}
    </div>