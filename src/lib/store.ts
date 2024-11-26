import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Song } from './types/song';

export const activeSong = writable({} as Song);
export const audio = writable();
export const collapsed = writable(false);


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