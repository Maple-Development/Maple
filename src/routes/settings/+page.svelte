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


    async function createLibrary() {
        await OPFS.initializeLibrary();
        console.log(await OPFS.ls('/'));

        let entries: FileSystemHandle[] = [];
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'audio/*';
        
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
                        trackNumber: metadata.common.track
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

        if (window.showDirectoryPicker) {
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
            // Non-Chrome (Safari, Firefox, mobile devices)
            input.addEventListener('change', (e) => {
                const files = input.files;
                if (files) {
                    handleFiles(files);
                }
            });
            input.click();
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
    })
</script>

<div class="flex flex-col justify-center items-center mt-16">
    <h2>You currently have {length} tracks imported</h2>
    <div class="p-10 px-20 rounded-sm mt-4 border border-1">
        <Button variant="secondary" on:click={() => createLibrary() }>Import Music</Button>
        <Button variant="destructive" on:click={() => OPFS.clearLibrary() }>Clear Library</Button>
    </div>
</div>