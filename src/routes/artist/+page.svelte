<script lang="ts">
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Artist } from "$lib/types/artist";
    import type { Song } from "$lib/types/song";
    import TrackWrapper from "$lib/components/TrackWrapper.svelte";
    import { ArrowUpAZ, ArrowDownZA, ListFilter, List } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { context, title } from "$lib/store";

    let artistName: string;
    let artist: Artist | undefined;
    let tracks: Song[] = [];
    let listType = "list";

    onMount(async () => {
        let params = new URLSearchParams(document.location.search);
        artistName = params.get('artist') ?? '';
        artist = await OPFS.get().artist(artistName);  
        sortTracks();
        if (artist && artist.name) {
        title.set(artist.name);
        } else {
            title.set("Unknown Artist");
        }
    })

    async function sortTracks() {
        if (artist && artist.tracks) {
            const newTracks: Song[] = [];
            for (const track of artist.tracks) {
                const trackData = await OPFS.get().track(track as string);
                if (trackData) {
                    newTracks.push(trackData);
                    console.log(trackData.trackNumber);
                }
            }
            newTracks.sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
            tracks = newTracks; // trigger re-render
        }
    }

    async function getImageUrl(imagePath: string): Promise<string> {
     const response = await OPFS.get().image(imagePath);
     const arrayBuffer = await response.arrayBuffer();
     const blob = new Blob([arrayBuffer]);
     return URL.createObjectURL(blob);
   }

    let sort = "title";
    let ascending = true;

    async function sortArtists(s: string) {
        sort = s;
        if (s === "title") {
            tracks = tracks.sort((a, b) => ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
        }
        if ($context.length === tracks.length) {
            const contextIds = new Set($context.map(song => song.id));
            const tracksIds = new Set(tracks.map(song => song.id));
            if ([...contextIds].every(id => tracksIds.has(id)) && [...tracksIds].every(id => contextIds.has(id))) {
                context.set(tracks);
            }

        }
    }

    function swapAscending() {
        ascending = !ascending;
        sortArtists(sort);
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

<div class="w-full mt-4 h-10 px-10 flex justify-between items-center">
    {#if artist && artist.name}
    <div class="font-bold text-lg underline">
        {artist.name}
    </div>
    {/if}
  <div class="flex items-center">
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
          <DropdownMenu.RadioItem value="title" on:click={() => sortArtists("name")}>Name</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => swapListType()}>
        <List size={20} color="white" />
    </Button>
  </div>
</div>


{#if listType !== "list"}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 ml-16 my-5">
        {#each tracks as track}
            <div class="flex flex-col items-start">
                {#await getImageUrl(track.image) then image}
                <TrackWrapper track={track} tracks={tracks}>
                    <img class="h-52 w-52 rounded-sm" src={image} alt={track.title} />
                </TrackWrapper>
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
    {:else}
    <div class="flex flex-col mx-4 mb-5 mt-2" >
      {#each tracks as track}
      <TrackWrapper track={track} tracks={tracks}>
        <div class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
          {#await getImageUrl(track.image) then image}
            <img class="h-24 w-24 mr-4" src={image} alt={track.title} />
          {:catch error}
            <div class="h-24 w-24 bg-gray-500 mr-4"></div>
          {/await}
          <div class="flex flex-col items-start flex-grow">
            <h1 class="text-foreground text-lg font-bold leading-none mb-1">{track.title}</h1>
            <h1 class="text-slate-400 text-base font-light leading-none">{track.artist}</h1>
          </div>
          <div class="flex flex-col items-end text-right ml-4">
            <h1 class="text-slate-400 text-base font-light leading-none">{formatDuration(track.duration)}</h1>
            <h1 class="text-slate-400 text-base font-light leading-none">{track.album}</h1>
          </div>
        </div>
    </TrackWrapper>
      {/each}
    </div>
  {/if}