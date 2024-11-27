import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Song } from './types/song';

export const activeSong = writable({} as Song);
export const context = writable([] as Song[]);
export const collapsed = writable(false);
export const audioPlayer = writable({
	audio: browser ? new Audio() : null,
	playing: false,
});
