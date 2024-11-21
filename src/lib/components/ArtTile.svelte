<script lang="ts">
import { audio, currentSongs, currentArtTile, activeSong, activeArt, recentlyPlayed } from '$lib/store.js';
export let art;
export let onClick: () => void;
export let id: any;
import {
		fileOpen,
		directoryOpen,
		fileSave,
		supported,
} from 'browser-fs-access';
import { get, set } from 'idb-keyval';
import AudioHandler from './AudioHandler.svelte';
export let title;
export let fileName: any;
let audioComponent: any;


    async function playSong() {
        if (audioComponent) {
            audioComponent.$destroy();
        }
        const fileHandleOrUndefined = await get('file');
    	let d;
		if (fileHandleOrUndefined) {
			d = fileHandleOrUndefined;
		} else {
			// @ts-ignore
			d = await window.showDirectoryPicker();
			await set('file', d);
		}
        audioComponent = new AudioHandler({ target: document.body});
        try {
            const song = await d.getFileHandle(fileName);
            const file = await song.getFile();
            const url = URL.createObjectURL(file);
            audio.set(url);
        } catch (error) {
            console.log(error);
        }

        $activeSong = $currentSongs.filter((a) => a.id === id)[0];
		$activeArt = $currentArtTile.filter((a) => a.id === id)[0];

        let recentSong = $currentArtTile.filter((a) => a.id === id)[0];
        let alreadyInRecentlyPlayed = $recentlyPlayed.find((a) => a.id === id);
        
        if (!alreadyInRecentlyPlayed) {
            $recentlyPlayed = [...$recentlyPlayed, recentSong];
        }

		if ($recentlyPlayed.length > 8) {
			$recentlyPlayed = $recentlyPlayed.slice($recentlyPlayed.length - 8);
		}
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-col p-4" on:click={onClick}>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img
        class="h-full w-full rounded-lg object-cover max-h-64 max-w-64 sm:max-h-80 sm:max-w-80 md:max-h-96 md:max-w-96 lg:max-h-[30rem] lg:max-w-[30rem] xl:max-h-[35rem] xl:max-w-[35rem] hover:opacity-50 focus:opacity-50" 
        src={art}
        alt="art"
        on:click={playSong}
    />
    <div class="flex flex-col">
        <p class="text-center text-lg py-2 px-2 line-clamp-1 overflow-hidden whitespace-nowrap overflow-ellipsis width-fit block">{title}</p>
    </div>
</div>
