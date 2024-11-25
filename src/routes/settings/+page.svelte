<script lang="ts">
//@ts-nocheck
    import { OPFS } from "$lib/opfs";
    import Button from "$lib/components/ui/button/button.svelte";
    import { parseBlob } from 'music-metadata';
    import type { Song } from "$lib/types/song";
    import type { Album } from "$lib/types/album";
    import type { Artist } from "$lib/types/artist";
    import { v4 as uuidv4 } from 'uuid';
    import { onMount } from "svelte";


    async function createLibrary() {
    await OPFS.initializeLibrary();
    console.log(await OPFS.ls('/'));

     // Prompt Folder Selection
     const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
     
     for await (const entry of dirHandle.values()) {
         if (entry.kind === 'file') {
             const file: File = await entry.getFile();
             console.log(`Found file: ${file.name}`);
             if (file.type === 'audio/mpeg') {
                 const metadata = await parseBlob(file);
                 const track: Song = {
                     id: uuidv4(),
                     title: metadata.common.title,
                     artist: metadata.common.artist,
                     album: metadata.common.album,
                     year: metadata.common.year,
                     genre: metadata.common.genre,
                     duration: metadata.format.duration,
                     image: metadata.common.picture ? new Blob([metadata.common.picture[0].data], { type: metadata.common.picture[0].format }) : undefined,
                     trackNumber: metadata.common.track
                 }

                 const album: Album = {
                     id: uuidv4(),
                     title: metadata.common.album,
                     artist: metadata.common.artist,
                     year: metadata.common.year,
                     genre: metadata.common.genre,
                     image: metadata.common.picture ? new Blob([metadata.common.picture[0].data], { type: metadata.common.picture[0].format }) : undefined,
                 }

                 const artist: Artist = {
                     id: uuidv4(),
                     name: metadata.common.artist,
                 }

                 await OPFS.addAlbum(album, track.id);
                 await OPFS.addArtist(artist, track.id, track.album);
                 await OPFS.addTrack(track);
                 await OPFS.addFile(track.id, file);
             }
         }
     }
    }

    let length = 0;
    async function getLength() {
        length = (await OPFS.ls('/tracks')).length - 1;
    }

    onMount(() => {
        getLength();
    })
</script>

<div class="flex flex-col justify-center items-center mt-16">
    <h2>You currently have {length} tracks imported</h2>
    <div class="p-10 px-20 rounded-sm mt-4 border border-1">
        <Button variant="secondary" on:click={() => createLibrary() }>Import Music</Button>
    </div>
</div>