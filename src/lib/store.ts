import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Song } from './song';
import type { Art } from './art';

export const sources = writable([{}]);
export const currentSongs = writable([] as Song[]);
export const currentArtTile = writable([] as Art[]);
export const activeSong = writable({} as Song);
export const activeArt = writable({} as Art);

if (browser) {
	// @ts-ignore
	sources.set(JSON.parse(localStorage.getItem('sources')) || []);

	sources.subscribe((value) => {
		localStorage.setItem('sources', JSON.stringify(value));
	});
}
