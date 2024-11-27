import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Song } from './types/song';

export const activeSong = writable({} as Song);
export const context = writable([] as Song[]);
export const collapsed = writable(false);
export const audioPlayer = writable({
  audio: browser ? new Audio() : null,
  onEnded: () => {},
  playing: false,
  volume: 100
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
  	  if (value.audio instanceof HTMLAudioElement && value.volume !== undefined) {
		console.log(value.volume);
		value.audio.volume = value.volume / 100;
	  }
	}
  });


function createTitle() {
	const {subscribe, set, update} = writable('');
	
	return {
		subscribe,
		set: (value: any) => {
			set(`${value} • UMLA`)
		},
		clear: () => {
			set('UMLA');
		}
	}
}

export const title = createTitle();