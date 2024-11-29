<script lang="ts">
    import { OPFS } from "$lib/opfs";
    import { page } from '$app/stores';
    import Button from "$lib/components/ui/button/button.svelte";
    import { Pencil, Check, Plus } from "lucide-svelte";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import type { Playlist } from "$lib/types/playlist";
    import type { Song } from "$lib/types/song";
    import { v4 as uuidv4 } from 'uuid';
    import { onMount } from "svelte";
    import * as Drawer from "$lib/components/ui/drawer/index.js";
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
    // @ts-ignore
    import Lazy from 'svelte-lazy';

    let doCreate = false;
    let editModeOn = true;
    let changedName = "";
    let changedDescription = "";
    let imageFile: Blob | null = null;
    let playlists: Playlist[] = [];
    let newPlaylist: Playlist = {
        id: uuidv4(),
        name: "My Playlist",
        description: "A playlist I just made!",
        image: "",
        tracks: []
    }
    let songs: Song[] = [];
    let addedSongs: String[] = [];
    let curSongs: Song[] = [];
    $: params =  new URLSearchParams($page.url.search);
    $: { doCreate = params.get('create') === 'true'; }

    onMount(async () => {
        songs = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
        changedName = newPlaylist.name;
        changedDescription = newPlaylist.description;
        playlists = await OPFS.get().playlists();
    });

    async function getImageUrl(imagePath: string): Promise<string> {
     const response = await OPFS.get().image(imagePath);
     const arrayBuffer = await response.arrayBuffer();
     const blob = new Blob([arrayBuffer]);
     return URL.createObjectURL(blob);
    }

    async function editMode() {
        editModeOn = !editModeOn; 

        if (!editModeOn && newPlaylist) {
            const doImage = imageFile !== null;
            const modifiedplaylist: Playlist = {
                id: newPlaylist.id,
                name: changedName,
                description: newPlaylist.description,
                image: doImage ? imageFile : newPlaylist.image,
                tracks: newPlaylist.tracks
            };
            OPFS.addPlaylist(modifiedplaylist);
            let updatedPlaylist = await OPFS.get().playlist(modifiedplaylist.id.toString());
            if (updatedPlaylist) {
                newPlaylist = updatedPlaylist;
            }
            doCreate = false;
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

    let open = false;

    function toggleSongSelection(song: Song) {
        const index = addedSongs.findIndex(s => s === song.id);
        if (index === -1) {
            addedSongs = [...addedSongs, song.id];
            curSongs = [...curSongs, song];
        } else {
            addedSongs = addedSongs.filter(s => s !== song.id);
            curSongs = curSongs.filter(s => s.id !== song.id);
        }
        console.log(addedSongs);
    }

    $: isToggled = (song: Song) => addedSongs.includes(song.id);

    function submitSongs() {
        newPlaylist.tracks = addedSongs;
        open = false;
    }

    function formatDuration(duration: number): string {
      const roundedDuration = Math.round(duration);
      const minutes = Math.floor(roundedDuration / 60);
      const seconds = roundedDuration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
</script>

{#if !doCreate}
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-6 md:gap-x-8 lg:gap-x-10 xl:gap-x-12 ml-16 my-5">
    {#each playlists as playlist}
    <div class="flex flex-col items-start">
        {#await getImageUrl(playlist.image) then image}
        <a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
            <img src={image} class="h-52 w-52 object-cover rounded-sm" alt={playlist.name} />
        </a>
        {:catch error}
        <a class="pointer" href={`/playlist?playlist=${playlist.id}`}>
            <div class="h-24 w-24 bg-gray-500 mr-4"></div>
        </a>
        {/await}
        <div class="flex flex-row items-start">
            <div class="flex flex-col items-start h-full mt-4">
                <h1 class="text-foreground text-lg font-bold leading-none mb-1">{playlist.name}</h1>
            </div>
        </div>
    </div>
    {/each}
</div>
{:else}
<div class="mt-4 h-fit px-10 justify-between flex p-5 border-gray-600 rounded-md">
    <div class="flex">
        <div>
            {#if editModeOn}
            <input type="file" id="files" class="block w-full px-2 py-1 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500" accept="image/*" multiple on:change={(e) => handlePhotoChange(e) } />
            {/if}
        </div>
        <div class="flex flex-col items-start ml-7">
            <div class="flex flex-col items-start">
                {#if editModeOn}
                <h1 bind:innerHTML={changedName} contenteditable="true" class="text-foreground text-2xl font-bold leading-none mb-1 underline border p-1 rounded-sm border-1">{newPlaylist?.name}</h1>
                <h1 bind:innerHTML={changedDescription} contenteditable="true" class="text-slate-400 text-lg font-light leading-none underline border p-1 rounded-sm border-1">{newPlaylist?.description}</h1>
                {:else}
                <h1 class="text-foreground text-2xl font-bold leading-none mb-1">{newPlaylist?.name}</h1>
                <h1 class="text-slate-400 text-lg font-light leading-none p">{newPlaylist?.description}</h1>
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
    </div>
</div>
<Separator class="w-[95%] ml-14 mb-4 mt-1 pr-20"></Separator>


<div class="flex flex-col mx-4 mb-5 mt-2">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-missing-attribute -->
    <a on:click={() => open = true} class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
    <div class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
        <div class="h-24 w-24 bg-gray-500 mr-4 flex items-center justify-center">
            <div class="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                <Plus size={20} color="black" />
            </div>
        </div>
        <div class="flex flex-col items-start flex-grow">
            <h1 class="text-foreground text-lg font-bold leading-none mb-1">Add Track</h1>
        </div>
    </div>
    </a>
</div>

<div class="flex flex-col mx-4 mb-5 mt-2" >
    {#each curSongs as track}
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
        </div>
      </div>
    {/each}
  </div>

<Drawer.Root bind:open>
    <Drawer.Content>
      <div class="mx-auto w-full max-w-lg">
        <Drawer.Header>
          <Drawer.Title>Select Tracks</Drawer.Title>
          <Drawer.Description>You can select multiple tracks</Drawer.Description>
        </Drawer.Header>
            <section data-vaul-no-drag>
                <ScrollArea class="h-72 w-full rounded-md border">
                    {#each songs as song}
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a on:click={() => toggleSongSelection(song)} class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
                    <div class="flex flex-row items-center hover:bg-secondary py-2 px-2 rounded-sm">
                        <div class="h-24 w-24 bg-gray-500 mr-4 flex items-center justify-center">
                            {#await getImageUrl(song.image) then image}
                            {#if isToggled(song)}
                                <Lazy keep={true}>
                                    <img class="border-2 border-green-400 h-24 w-24 mr-4" src={image} alt={song.title} />
                                </Lazy>
                            {:else}
                                <Lazy keep={true}>
                                    <img class="h-24 w-24 mr-4" src={image} alt={song.title} />
                                </Lazy>
                            {/if}
                            {:catch error}
                                <div class="h-24 w-24 bg-gray-500 mr-4"></div>
                            {/await}
                        </div>
                        <div class="flex flex-col items-start flex-grow">
                            <h1 class="text-foreground text-lg font-bold leading-none mb-1">{song.title}</h1>
                            <h1 class="text-slate-400 text-md font-light leading-none mb-1">{song.artist}</h1>
                        </div>
                    </div>
                    </a>
                    {/each}
                </ScrollArea>
            </section>
        <Drawer.Footer>
          <Button on:click={() => submitSongs()}>Submit</Button>
          <Drawer.Close asChild let:builder>
            <Button builders={[builder]} variant="outline">Cancel</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
