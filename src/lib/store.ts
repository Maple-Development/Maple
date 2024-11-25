import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Song } from './types/song';

export const sources = writable([{}]);
export const currentSongs = writable([] as Song[]);
export const activeSong = writable({} as Song);
export const audio = writable();
export const collapsed = writable(false);

if (browser) {
	// @ts-ignore
	sources.set(JSON.parse(localStorage.getItem('sources')) || []);

	sources.subscribe((value) => {
		localStorage.setItem('sources', JSON.stringify(value));
	});
}

if (browser) {
	audio.subscribe((value) => {
	  if (value) {
		var audioElement = document.getElementsByTagName('audio')[0];
		// @ts-ignore
		audioElement.src = value;
		audioElement.play().catch((err) => {
		  console.log(err);
		});
	  }
	});
}