import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Song } from './types/song';

export const activeSong = writable({} as Song);
export const context = writable([] as Song[]);
export const collapsed = writable(false);
export const audioPlayer = writable({
  audio: browser ? new Audio() : null,
  onEnded: () => {},
  playing: false
});

let endedHandler: ((this: HTMLAudioElement, ev: Event) => any) | null = null;

audioPlayer.subscribe((value) => {
  if (browser) {
	if (value.audio instanceof HTMLAudioElement) {
	  if (endedHandler) {
		value.audio.removeEventListener('ended', endedHandler);
	  }

	  endedHandler = () => {
		value.onEnded();
	  };

	  value.audio.addEventListener('ended', endedHandler);
	}
  }
});