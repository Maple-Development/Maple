<script lang="ts">
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Album } from "$lib/types/album";
    import type { Song } from "$lib/types/song";
    import { ArrowUpAZ, ArrowDownZA, ListFilter, SeparatorVertical, List } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import TrackWrapper from "$lib/components/TrackWrapper.svelte";
    import { context, title } from "$lib/store";
     // @ts-ignore
     import Lazy from 'svelte-lazy';

    let albumName: string;
    let album: Album | undefined;
    let tracks: Song[] = [];
    let disks: number = 0;
    let alldisks: Song[][] = [];
    let listType = "grid";

    onMount(async () => {
        let params = new URLSearchParams(document.location.search);
        albumName = params.get('album') ?? '';
        album = await OPFS.get().album(albumName);  
        await sortTracks();
        // sort disks
        const diskMap: { [disk: number]: Song[] } = {};
        for (const track of tracks) {
            const disk = track.disk ?? 1;
            if (!diskMap[disk]) {
                diskMap[disk] = [];
            }
            diskMap[disk].push(track);
        }
        alldisks = Object.values(diskMap).map(diskTracks => 
            diskTracks.sort((a, b) => a.trackNumber - b.trackNumber)
        );

        disks = alldisks.length;
        tracks = alldisks.flat();

        title.set(album?.name ?? "Unknown Album");
    })

    async function sortTracks() {
        if (album && album.tracks) {
            const newTracks: Song[] = [];
            for (const track of album.tracks) {
                const trackData = await OPFS.get().track(track as string);
                if (trackData) {
                    newTracks.push(trackData);
                }
            }
            newTracks.sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
            console.log(newTracks);
            tracks = newTracks; // trigger re-render
        }
    }

    async function getImageUrl(imagePath: string): Promise<string> {
     const response = await OPFS.get().image(imagePath);
     const arrayBuffer = await response.arrayBuffer();
     const blob = new Blob([arrayBuffer]);
     return URL.createObjectURL(blob);
   }

    let sort = "track";
    let ascending = true;

    async function orderTracks(s: string) {
        sort = s;
        if (s === "title") {
            tracks = tracks.sort((a, b) => ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
        } else if (s === "duration") {
            tracks = tracks.sort((a, b) => ascending ? a.duration - b.duration : b.duration - a.duration);
        } else if (s === "track") {
            if (alldisks.length > 1) {
                alldisks = alldisks.reverse().map(diskTracks => diskTracks.slice().reverse());
                tracks = alldisks.flat();
            } else {
            tracks = tracks.sort((a, b) => ascending ? (a.trackNumber ?? 0) - (b.trackNumber ?? 0) : (b.trackNumber ?? 0) - (a.trackNumber ?? 0));
            }
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
        orderTracks(sort);
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
                  <DropdownMenu.RadioItem value="track" on:click={() => orderTracks("track")}>Track #</DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="title" on:click={() => orderTracks("title")}>Title</DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem value="duration" on:click={() => orderTracks("duration")}>Duration</DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => swapListType()}>
            <List size={20} color="white" />
        </Button>
</div>


{#if listType !== "grid"}
<div class="flex flex-col gap-y-8 ml-16 my-5">
        {#if alldisks.length > 1 && sort === "track"}
            {#each alldisks as disk, diskIndex}
                {#if diskIndex > 0}
                    <div class="flex flex-col items-start">
                        <Separator class="w-[95%] mb-4 mt-1 pr-20"></Separator>
                    </div>
                {/if}
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12">
                    {#each disk as track}
                        <div class="flex flex-col items-start">
                            {#await getImageUrl(track.image) then image}
                                <TrackWrapper track={track} tracks={tracks}>
                                    <Lazy keep={true}>
                                        <img class="h-52 w-52 rounded-sm" src={image} alt={track.title} />
                                    </Lazy>
                                </TrackWrapper>
                                <div class="flex flex-col items-start mt-4">
                                    <h3 class="text-foreground text-lg font-bold leading-none mb-1">{track.title}</h3>
                                    <p class="text-slate-400 text-base font-light leading-none">{track.artist}</p>
                                </div>
                            {:catch error}
                                <div class="h-52 w-52 bg-gray-500 rounded-sm animate-pulse"></div>
                            {/await}
                        </div>
                    {/each}
                </div>
            {/each}
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12">
                {#each tracks as track}
                    <div class="flex flex-col items-start">
                        {#await getImageUrl(track.image) then image}
                            <TrackWrapper track={track} tracks={tracks}>
                                <Lazy keep={true}>
                                    <img class="h-52 w-52 rounded-sm" src={image} alt={track.title} />
                                </Lazy>
                            </TrackWrapper>
                            <div class="flex flex-col items-start mt-4">
                                <h3 class="text-foreground text-lg font-bold leading-none mb-1">{track.title}</h3>
                                <p class="text-slate-400 text-base font-light leading-none">{track.artist}</p>
                            </div>
                        {:catch error}
                            <div class="h-52 w-52 bg-gray-500 rounded-sm animate-pulse"></div>
                        {/await}
                    </div>
                {/each}
            </div>
        {/if}
        </div>
    {:else}
        <div class="flex flex-col mx-4 mb-5 mt-2">
        {#if alldisks.length > 1 && sort === "track"}
            {#each alldisks as disk, diskIndex}
                {#if diskIndex > 0}
                    <div class="flex flex-col items-start">
                        <Separator class="w-[95%] mb-4 mt-1 pr-20"></Separator>
                    </div>
                {/if}
                <div class="flex flex-col mx-4 mb-5 mt-2">
                    {#each disk as track}
                        <TrackWrapper track={track} tracks={tracks}>
                            <div class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
                                {#await getImageUrl(track.image) then image}
                                    <Lazy keep={true}>
                                        <img class="h-24 w-24 mr-4" src={image} alt={track.title} />
                                    </Lazy>
                                {:catch error}
                                    <div class="h-24 w-24 bg-gray-500 mr-4"></div>
                                {/await}
                                <div class="flex flex-col items-start flex-grow">
                                    <h1 class="text-foreground text-lg font-bold leading-none mb-1">{track.title}</h1>
                                    <h1 class="text-slate-400 text-base font-light leading-none">{track.artist}</h1>
                                </div>
                                <div class="flex flex-col items-end text-right ml-4">
                                    <h1 class="text-slate-400 text-base font-light leading-none">{track.year}</h1>
                                    <h1 class="text-slate-400 text-base font-light leading-none">{track.artist}</h1>
                                </div>
                            </div>
                        </TrackWrapper>
                    {/each}
                </div>
            {/each}
        {:else}
            <div class="flex flex-col mx-4 mb-5 mt-2">
                {#each tracks as track}
                    <TrackWrapper track={track} tracks={tracks}>
                        <div class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
                            {#await getImageUrl(track.image) then image}
                                <Lazy keep={true}>
                                    <img class="h-24 w-24 mr-4" src={image} alt={track.title} />
                                </Lazy>
                            {:catch error}
                                <div class="h-24 w-24 bg-gray-500 mr-4"></div>
                            {/await}
                            <div class="flex flex-col items-start flex-grow">
                                <h1 class="text-foreground text-lg font-bold leading-none mb-1">{track.title}</h1>
                                <h1 class="text-slate-400 text-base font-light leading-none">{track.artist}</h1>
                            </div>
                            <div class="flex flex-col items-end text-right ml-4">
                                <h1 class="text-slate-400 text-base font-light leading-none">{track.year}</h1>
                                <h1 class="text-slate-400 text-base font-light leading-none">{track.artist}</h1>
                            </div>
                        </div>
                    </TrackWrapper>
                {/each}
            </div>
        {/if}
    </div>
{/if}
