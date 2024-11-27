<script lang="ts">
    //@ts-nocheck
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Artist } from "$lib/types/artist";
    import { ArrowUpAZ, ArrowDownZA, ListFilter } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { context } from "$lib/store";

    let artists: Artist[] = [];

    onMount(async () => {
        artists = (await OPFS.get().artists()).sort((a, b) => a.name.localeCompare(b.name));
    });

   async function getImageUrl(imagePath: string): Promise<string> {
     const response = await OPFS.get().image(imagePath);
     const arrayBuffer = await response.arrayBuffer();
     const blob = new Blob([arrayBuffer]);
     console.log(blob);
     return URL.createObjectURL(blob);
   }

   let sort = "name";
    let ascending = true;

    async function sortArtists(s: string) {
        sort = s;
        if (s === "name") {
            artists = artists.sort((a, b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
        }
    }

    function swapAscending() {
        ascending = !ascending;
        sortArtists(sort);
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
                  <DropdownMenu.RadioItem value="name" on:click={() => sortArtists("name")}>Name</DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
</div>


<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 ml-16 my-5">
    {#each artists as artist}
        <div class="flex flex-col items-start">
            {#await getImageUrl(artist.image) then image}
            <a class="pointer" href={`/artist?artist=${artist.id}`}>
            <div class="h-52 w-52 bg-gray-500 rounded-[50%] animate-pulse"></div>
            </a>
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