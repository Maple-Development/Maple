<script lang="ts">
    import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import type { Playlist } from "$lib/types/playlist";
    import type { Song } from "$lib/types/song";
    import TrackWrapper from "$lib/components/TrackWrapper.svelte";
    import { ArrowUpAZ, ArrowDownZA, ListFilter, List, Check, Pencil, Trash } from "lucide-svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { context, title } from "$lib/store";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { page } from '$app/stores';
    //@ts-ignore
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { goto } from "$app/navigation";
     // @ts-ignore
     import Lazy from 'svelte-lazy';

    let playlistName: string;
    let playlist: Playlist | undefined;
    let tracks: Song[] = [];
    let listType = "list";
    let editModeOn = false;
    let changedName = "";
    let changedDescription = "";
    let imageFile: Blob | null = null;
    $: params =  new URLSearchParams($page.url.search);
    $: { refresh(params.get('playlist') ?? '') }
    onMount(async () => {
        let params = new URLSearchParams(document.location.search);
        playlistName = params.get('playlist') ?? '';
        playlist = await OPFS.get().playlist(playlistName);  
        console.log(playlist);
        sortTracks();
        if (playlist && playlist.name) {
        title.set(playlist.name);
        } else {
            title.set("Unknown playlist");
        }

        changedName = playlist?.name?.toString() ?? "";
        changedDescription = playlist?.description?.toString() ?? "";
    })

    async function refresh(playlistName: string) {
        playlist = await OPFS.get().playlist(playlistName);  
        sortTracks();
        if (playlist && playlist.name) {
        title.set(playlist.name);
        } else {
            title.set("Unknown playlist");
        }

        changedName = playlist?.name?.toString() ?? "";
    }

    async function sortTracks() {
        if (playlist && playlist.tracks) {
            const newTracks: Song[] = [];
            for (const track of playlist.tracks) {
                const trackData = await OPFS.get().track(track as string);
                console.log(trackData);
                if (trackData) {
                    newTracks.push(trackData);
                }
            }
            tracks = newTracks; // trigger re-render
            console.log(tracks);
        }
    }

    async function getImageUrl(imagePath: string): Promise<string> {
     const response = await OPFS.get().image(imagePath);
     const arrayBuffer = await response.arrayBuffer();
     const blob = new Blob([arrayBuffer]);
     if (blob && blob.size === 0) {
         return "";
     }
     return URL.createObjectURL(blob);
   }

    let sort = "title";
    let ascending = true;

    async function sortplaylists(s: string) {
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
        sortplaylists(sort);
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

    async function editMode() {
        editModeOn = !editModeOn; 

        if (!editModeOn && playlist) {
            const doImage = imageFile !== null;
            const modifiedplaylist: Playlist = {
                id: playlist.id,
                name: changedName,
                description: changedDescription,
                image: doImage ? imageFile : playlist.image,
                tracks: playlist.tracks,
            };
            OPFS.playlist().edit(modifiedplaylist);
            let newplaylist = await OPFS.get().playlist(modifiedplaylist.id.toString());
            playlist = newplaylist;
        }
    }

    function handlePhotoChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file); 
            reader.onload = () => {
                const imageBlob = new Blob([reader.result as ArrayBuffer], { type: file.type });
                imageFile = imageBlob;
            };
        }
    }

    function deletePlaylist() {
        if (playlist) {
            OPFS.playlist().delete(playlist);
            goto('/playlists');
        } else {
            console.error("Playlist not found");
        }
    }
</script>

<div class="mt-4 h-fit px-10 justify-between flex p-5 border-gray-600 rounded-md">
    <div class="flex">
        <div>
        {#await getImageUrl(playlist?.image) then image}
            {#if editModeOn}
            <input type="file" id="files" class="block w-full px-2 py-1 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500" accept="image/*" multiple on:change={(e) => handlePhotoChange(e) } />
            {:else}
            {#if image !== ""}
              <img class="h-64 w-64 rounded-sm" src={image} alt={playlist?.name?.toString() ?? ''} />
            {:else}
              <div class="h-52 w-52 bg-gray-500 rounded-[50%] animate-pulse"></div>
            {/if}
            {/if}
        {:catch error}
            <div class="h-52 w-52 bg-gray-500 rounded-sm animate-pulse"></div>
        {/await}
        </div>
        <div class="flex flex-col items-start ml-7">
            <div class="flex flex-col items-start">
                {#if editModeOn}
                <h1 bind:innerHTML={changedName} contenteditable="true" class="text-foreground text-2xl font-bold leading-none mb-1 underline border p-1 rounded-sm border-1">{playlist?.name}</h1>
                <h1 bind:innerHTML={changedDescription} contenteditable="true" class="text-slate-400 text-base font-light leading-none mb-1 underline border p-1 rounded-sm border-1">{playlist?.description}</h1>
                {:else}
                <h1 class="text-foreground text-2xl font-bold leading-none mb-1">{playlist?.name}</h1>
                <h1 class="text-slate-400 text-base font-light leading-none mb-1">{playlist?.description}</h1>
                {/if}
            </div>
        </div>
    </div>
    <div>
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => editMode()}>
            {#if editModeOn}
                <Check size={20} color="white" />
            {:else}
                <Pencil size={20} color="white" />
            {/if}
        </Button>
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <Button class="my-1 ml-3 h-10 w-10 px-1" variant="destructive">
                    <Trash size={20} color="white" />
                </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
                <AlertDialog.Description>
                  This action cannot be undone. This will NOT delete the tracks within the playlist, only the playlist itself.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action on:click={() => deletePlaylist()}>Continue</AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
    </div>
</div>
<Separator class="w-[95%] ml-14 mb-4 mt-1 pr-20"></Separator>
<div class="mt-4 h-10 px-5 flex justify-end border-gray-600 mx-4">
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
                  <DropdownMenu.RadioItem value="title" on:click={() => sortplaylists("name")}>Name</DropdownMenu.RadioItem>
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
                <TrackWrapper className=""  track={track} tracks={tracks}>
                  <Lazy keep={true}>
                    <img class="h-52 w-52 rounded-sm" src={image} alt={track.title} />
                  </Lazy>
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
      <TrackWrapper className=""  track={track} tracks={tracks}>
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
            <h1 class="text-slate-400 text-base font-light leading-none">{formatDuration(track.duration)}</h1>
            <h1 class="text-slate-400 text-base font-light leading-none">{track.album}</h1>
            <h1 class="text-slate-400 text-base font-light leading-none">{track.year}</h1>
          </div>
        </div>
    </TrackWrapper>
      {/each}
    </div>
  {/if}