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
    import { Textarea } from "$lib/components/ui/textarea";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { title } from "$lib/store";



    let errorText = "LOG will appear here";

    async function createLibrary(mobileFiles: FileList) {
        try {
            await OPFS.initializeLibrary();

            let entries: FileSystemHandle[] = [];
            const input = document.getElementById('files') as HTMLInputElement;
            
            const handleFiles = async (files: FileList) => {
                let i = 0;
                for (const file of Array.from(files)) {
                    if (file.type.startsWith('audio/')) {
                        i++;
                        toast(`${i} of ${files.length} | Processing ${file.name}`);
                        try {
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
                        } catch (error) {
                            errorText += `\n${error}`;
                        }
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
        } catch (error) {
            errorText += `\n${error}`;
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
        title.set("Settings");
    })

    let device = "chrome";
    function findDevice() {
        if (!window.showDirectoryPicker) {
            device = "ew";
        }
    }
    let dir = "";
    let text = "> ";
    async function send() {
        const lines = text.split('\n');
        const newText = lines[lines.length - 1].substring(dir.length + 2);
        if (newText.startsWith("ls")) {
            let selectedDir = '';
            let subdir = newText.split(' ')[1] || '';
            if (subdir.startsWith('/')) {
                subdir = subdir.substring(1);
            }
            if (!subdir.endsWith('/') && subdir !== '') {
                subdir = subdir + '/';
            }
            if (dir === '' && subdir === '') {
                selectedDir = '/';
            } else if (dir === '') {
                selectedDir = subdir;
            } else {
                selectedDir = dir + subdir;
            }

            const ls = await OPFS.ls(selectedDir);
            let names = [];
            ls.forEach((file) => {
                names.push(file.name);
            });

            if (names.length === 0) {
                text += `No files found in ${selectedDir}\n${dir}> `;
            } else {
                text += `${names.join('\n')}\n${dir}> `;
            }
        } else if (newText == "clear") {
            await OPFS.clearLibrary();
            text += "Library cleared\n" + dir + "> ";
            getLength();
        } else if (newText == "exit") {
            text = dir +"> ";
        } else if (newText == "help") {
            text += '\n';
            text += "Welcome to the OPFS CLI!\n";
            text += "Commands: ls, clear, exit, import, cd\n For more information, run the command with the -h flag\n" + dir + "> ";
        } else if (newText == "import") {
            await createLibrary();
            text += "Library imported\n" + dir + "> ";
        } else if (newText.startsWith("cd")) {
            dir = newText.split(' ')[1];
            if (!dir.startsWith('/')) {
                dir = '/' + dir;
            }
            if (!dir.endsWith('/')) {
                dir = dir + '/';
            }
            text += "\n" + dir + "> ";
        } else {
            text += "Command not found\n" + dir + "> ";
        }
    }
    function handleKeydown(event) {
        if (event.key === 'Backspace') {
            if (text.length <= dir.length + 2) {
                event.preventDefault();
            }
        }
        if (event.key === 'Enter') {
            if (text.length > 2) {
                send();
            } else {
                event.preventDefault();
            }
        }
    }

    let devMode = false;
    let showLogging = false;
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

<div class="flex flex-col items-center justify-center mt-5 space-x-2">
    <div class="flex flex-row items-center mb-2">
        <Switch class="mr-2" id="devMode" bind:checked={devMode} />
        <Label for="devMode">
            Developer Mode
        </Label>
    </div>
    <div class="flex flex-row items-center mt-1">
        <Switch class="mr-2" id="logging" bind:checked={showLogging} />
        <Label for="logging">
            Show Logging
        </Label>
    </div>
</div>


{#if devMode}
<div class="mx-10 mt-10 font-['VT323']">
    <Textarea on:keydown={handleKeydown} class="h-48" bind:value={text} placeholder="Type your message here." />
</div>
{/if}

{#if showLogging}
<div class="mx-10 mt-10 font-['VT323']">
    <Textarea class="h-48" bind:value={errorText} placeholder="LOG" disabled />
</div>
{/if}

<style>
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
</style>