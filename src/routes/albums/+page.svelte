<script lang="ts">
//@ts-nocheck
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Album } from "$lib/types/album";
    import { ArrowUpAZ, ArrowDownZA, ListFilter, List } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { title } from "$lib/store";
     // @ts-ignore
     import Lazy from 'svelte-lazy';


    let albums: Album[] = [];

    onMount(async () => {
        albums = (await OPFS.get().albums()).sort((a, b) => a.name.localeCompare(b.name));
        title.set("Albums");
    });

   async function getImageUrl(imagePath: string): Promise<string> {
     const response = await OPFS.get().image(imagePath);
     const arrayBuffer = await response.arrayBuffer();
     const blob = new Blob([arrayBuffer]);
     return URL.createObjectURL(blob);
   }

    let sort = "title";
    let ascending = true;
    let listType = "grid";

    async function sortAlbums(s: string) {
        sort = s;
        if (s === "title") {
            albums = albums.sort((a, b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)); // idk why I choose name instead of title but yeah
        } else if (s === "artist") {
            albums = albums.sort((a, b) => ascending ? a.artist.localeCompare(b.artist) : b.artist.localeCompare(a.artist));
        } else if (s === "year") {
            albums = albums.sort((a, b) => ascending ? a.year - b.year : b.year - a.year);
        }
    }

    function swapAscending() {
        ascending = !ascending;
        sortAlbums(sort);
    }

    function formatDuration(duration: number): string {
      const roundedDuration = Math.round(duration);
      const minutes = Math.floor(roundedDuration / 60);
      const seconds = roundedDuration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function swapListType() {
        if (listType === "list") {
            listType = "grid";
        } else {
            listType = "list";
        }
    }
</script>

<div class="w-full mt-4 h-10 px-10 flex justify-end">
    {#if ascending}
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => swapAscending()}>
            <ArrowUpAZ size={20} color="white" />
        </Button>
    {:else}
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => swapAscending()}>
            <ArrowDownZA size={20} color="white" />
        </Button>
    {/if}
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
                <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" builders={[builder]}>
                    <ListFilter size={20} color="white" />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="w-56">
              <DropdownMenu.Label>Sort By</DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.RadioGroup bind:value={sort}>
                  <DropdownMenu.RadioItem value="title" on:click={() => sortAlbums("title")}>Title</DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="artist" on:click={() => sortAlbums("artist")}>Artist</DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="year" on:click={() => sortAlbums("year")}>Year</DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => swapListType()}>
            <List size={20} color="white" />
        </Button>
</div>

{#if listType !== 'list'}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 ml-16 my-5">
        {#each albums as album}
            <div class="flex flex-col items-start">
                {#await getImageUrl(album.image) then image}
                    <a class="pointer" href={`/album?album=${album.id}`}>
                        <Lazy keep={true}>
                            <img class="h-52 w-52 rounded-sm" src={image} alt={album.name} />
                        </Lazy>
                    </a>
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
{:else}
    <div class="flex flex-col mx-4 mb-5 mt-2" >
        {#each albums as album}
        <a class="pointer" href={`/album?album=${album.id}`}>
        <div class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
            {#await getImageUrl(album.image) then image}
            <Lazy keep={true}>
                <img class="h-24 w-24 mr-4" src={image} alt={album.name} />
            </Lazy>
            {:catch error}
                <div class="h-24 w-24 bg-gray-500 mr-4"></div>
            {/await}
            <div class="flex flex-col items-start flex-grow">
                <h1 class="text-foreground text-lg font-bold leading-none mb-1">{album.name}</h1>
                <h1 class="text-slate-400 text-base font-light leading-none">{album.artist}</h1>
            </div>
            <div class="flex flex-col items-end text-right ml-4">
                <h1 class="text-slate-400 text-base font-light leading-none">{album.year}</h1>
                <h1 class="text-slate-400 text-base font-light leading-none">{album.artist}</h1>
            </div>
        </div>
        </a>
        {/each}
    </div>
{/if}