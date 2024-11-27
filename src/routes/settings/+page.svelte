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
    import { toast } from "svelte-sonner";


    async function createLibrary(mobileFiles: FileList) {
        await OPFS.initializeLibrary();
        console.log(await OPFS.ls('/'));

        let entries: FileSystemHandle[] = [];
        const input = document.getElementById('files') as HTMLInputElement;
        
        const handleFiles = async (files: FileList) => {
            let i = 0;
            for (const file of Array.from(files)) {
                if (file.type.startsWith('audio/')) {
                    i++;
                    toast(`${i} of ${files.length} | Processing ${file.name}`);
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
                        trackNumber: metadata.common.track.no,
                        disk: metadata.common.disk.no,
                        ext: file.name.split('.').pop(),
                    }

                    const album: Album = {
                        id: uuidv4(),
                        name: metadata.common.album,
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
                    await OPFS.addFile(track.id, file, track);
                }
            }
            toast.success(`Library added successfully!`);
            getLength();
        }

        if (window.showDirectoryPicker && !mobileFiles) {
            // Chrome only
            const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
            const files: File[] = [];
            
            for await (const entry of dirHandle.values()) {
                if (entry.kind === 'file') {
                    const file: File = await entry.getFile();
                    files.push(file);
                }
            }
            
            handleFiles(files);
        } else {
            if(mobileFiles) {
                handleFiles(input.files);   
            }
        }
    }

    let length = 0;
    async function getLength() {
        length = (await OPFS.ls('/tracks')).length - 1;
        if (length < 0) {
            length = 0;
        }
    }

    onMount(() => {
        getLength();
        findDevice();
    })

    let device = "chrome";
    function findDevice() {
        if (!window.showDirectoryPicker) {
            device = "ew";
        }
    }
</script>

<div class="flex flex-col justify-center items-center mt-16">
    <h2>You currently have {length} tracks imported</h2>
    <div class="p-10 px-20 rounded-sm mt-4 border border-1 justify-center items-center">
        {#if device == "ew"}
            <input type="file" id="files" class="block w-full px-2 py-1 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500" accept="audio/*" multiple on:change={(e) => createLibrary(e) } />
        {:else}
            <Button variant="secondary" on:click={() => createLibrary() }>Import Music</Button>
        {/if}
        <Button variant="destructive" on:click={() => OPFS.clearLibrary() }>Clear Library</Button>
    </div>
</div>