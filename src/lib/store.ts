import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { Song } from './types/song';

export const searchType = writable('tracks');
export const activeSong = writable({} as Song);
export const context = writable([] as Song[]);
let recentlyPlayed: [Song?, Song?, Song?, Song?, Song?, Song?, Song?, Song?, Song?, Song?] = [];
export const collapsed = writable(false);
export const curTime = writable([0] as number[]);
export const setCurTime = writable([0] as number[]);
export const isSmallDevice = writable(false);
export const audioPlayer = writable({
	audio: browser ? new Audio() : null,
	onEnded: () => {},
	playing: false,
	volume: 100,
	currentTime: 0,
	changeVolume: false
});
export const recentlyPlayedManager = writable({
	add: (value: Song) => {
		if (!recentlyPlayed.some(song => song?.id === value.id)) {
			recentlyPlayed = [value, ...recentlyPlayed].slice(0, 10) as [
				Song?,
				Song?,
				Song?,
				Song?,
				Song?,
				Song?,
				Song?,
				Song?,
				Song?,
				Song?
			];
			localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
		}
	},
	get: () => {
		if(!browser) return [];
		recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
		return recentlyPlayed;
	}
});

let endedHandler: ((this: HTMLAudioElement, ev: Event) => any) | null = null;
let durationChangeHandler: ((this: HTMLAudioElement, ev: Event) => any) | null = null;

export const currentDuration = derived(audioPlayer, ($audioPlayer) => {
	return $audioPlayer.audio?.duration ?? 0;
});

let currentTime = 0;

audioPlayer.subscribe((value) => {
	if (browser) {
		if (value.audio instanceof HTMLAudioElement) {
			if (!value.changeVolume) {
				if (endedHandler) {
					value.audio.removeEventListener('ended', endedHandler);
					endedHandler = null;
				}

				if (value.onEnded) {
					endedHandler = () => {
						value.onEnded();
					};
					value.audio.addEventListener('ended', endedHandler);
				}

				value.audio.ontimeupdate = () => {
					currentTime = value.audio?.currentTime ?? 0;
					if (value.playing) {
						curTime.set([value.audio?.currentTime ?? currentTime]);
						setCurTime.set([value.audio?.currentTime ?? currentTime]);
					}
				};

				if (durationChangeHandler) {
					value.audio.removeEventListener('durationchange', durationChangeHandler);
					durationChangeHandler = null;
				}

				durationChangeHandler = () => {
					audioPlayer.update((state) => ({ ...state }));
				};
				value.audio.addEventListener('durationchange', durationChangeHandler);

				if (value.audio instanceof HTMLAudioElement && value.currentTime !== undefined) {
					value.audio.currentTime = value.currentTime;
				}
			} else {
				if (value.audio instanceof HTMLAudioElement && value.volume !== undefined) {
						value.audio.volume = value.volume / 100;
						value.changeVolume = false;
						return;
					} else {
						value.changeVolume = false;
						return;
					}
				}
			}
		}
});
function createTitle() {
	const { subscribe, set, update } = writable('');

	return {
		subscribe,
		set: (value: any) => {
			set(`${value} • Maple`);
		},
		clear: () => {
			set('Maple');
		}
	};
}

export const title = createTitle();
