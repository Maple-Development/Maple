import { browser } from '$app/environment';
//import { Peer } from 'peerjs';
import { Socket } from 'socket.io-client';
import { derived, get, writable } from 'svelte/store';
import type { AddedFriend, PendingRequest, Song, User } from '$lib/types';
import { stats, statsManager } from './stats';
export { stats, statsManager };
import { OPFS } from '$lib/opfs';

export type QueueSource = 'none' | 'album' | 'playlist' | 'artist' | 'tracks' | 'recent' | 'custom';

export const pendingRequests = writable([] as PendingRequest[]);
export const friends = writable([] as AddedFriend[]);
export const isLoggedIn = writable(false);
export const friendNowPlaying = writable({} as Record<string, unknown>);
export const socket = writable(null as Socket | null);
//export const UserPeer = writable(null as Peer | null);
export const searchType = writable('tracks');
export const UserInfo = writable(null as User | null);
UserInfo.subscribe((value) => {
	if (browser) {
		if (!value) return;
		if (value === undefined) return;
		localStorage.setItem('UserInfo', JSON.stringify(value));
	}
});
export const SavedUser = writable({} as User);
export const activeSong = writable({} as Song);
export const context = writable([] as Song[]);
export type QueueSnapshot = {
	items: Song[];
	currentIndex: number;
	source: { type: QueueSource; id?: string; label?: string };
};
export const queueState = writable<QueueSnapshot>({
	items: [],
	currentIndex: -1,
	source: { type: 'none' }
});
export const loopEnabled = writable(true);
export const shuffleEnabled = writable(false);
export const originalQueue = writable<Song[]>([]);
export const recentlyPlayed = writable<Song[]>([]);
export const collapsed = writable(false);
// let currentTime = $derived($audioPlayer.audio?.currentTime ?? 0);
export const curTime = writable(0);
export const setCurTime = writable(0);
export const hideTips = writable(false);
hideTips.subscribe((value) => {
	if (value) {
		if (browser) {
			localStorage.setItem('hideTips', 'true');
		}
	}
});
export const isSmallDevice = writable(false);
export const audioPlayer = writable({
	audio: browser ? new Audio() : null,
	onEnded: () => {},
	playing: false,
	volume: 100,
	currentTime: 0,
	changeVolume: false
});
export const recentlyPlayedManager = {
	add: (value: Song) => {
		recentlyPlayed.update((current) => {
			if (current.some((song) => song?.id === value.id)) {
				return current;
			}
			const updated = [value, ...current].slice(0, 10);
			if (browser) {
				localStorage.setItem('recentlyPlayed', JSON.stringify(updated));
			}
			return updated;
		});
	},
	load: () => {
		if (!browser) return;
		const stored = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
		recentlyPlayed.set(stored);
	},
	get: () => {
		if (!browser) return [];
		return get(recentlyPlayed);
	}
};

let endedHandler: ((this: HTMLAudioElement, ev: Event) => void) | null = null;
let durationChangeHandler: ((this: HTMLAudioElement, ev: Event) => void) | null = null;

export const currentDuration = derived(audioPlayer, ($audioPlayer) => {
	return $audioPlayer.audio?.duration ?? 0;
});

let currentTime = 0;
let lastListenTime = 0;
let lastListenSongId = '';

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
						curTime.set(value.audio?.currentTime ?? currentTime);
						setCurTime.set(value.audio?.currentTime ?? currentTime);
					}
					const song = get(activeSong);
					const state = get(queueState);
					if (value.playing && song?.id) {
						if (song.id !== lastListenSongId) {
							lastListenSongId = song.id;
							lastListenTime = value.audio?.currentTime ?? 0;
						} else {
							const nextTime = value.audio?.currentTime ?? 0;
							const delta = nextTime - lastListenTime;
							lastListenTime = nextTime;
							if (delta > 0 && delta <= 2.5) {
								statsManager.recordListeningSeconds(song, state.source, delta);
							}
						}
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
					localStorage.setItem('volume', value.volume.toString());
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
	const { subscribe, set } = writable('');

	return {
		subscribe,
		set: (value: string) => {
			set(`${value} • Maple`);
		},
		clear: () => {
			set('Maple');
		}
	};
}

function loadPreferences() {
	return {
		load: () => {
			if (browser) {
				const storedVolume = localStorage.getItem('volume');
				const volume = parseInt(storedVolume ?? '100');
				if (storedVolume) {
					audioPlayer.update((state) => ({ ...state, volume: volume, changeVolume: true }));
				}
			}
		}
	};
}

export const loadPreferencesStore = loadPreferences();

export const title = createTitle();

if (browser) {
	const storedhideTips = localStorage.getItem('hideTips');
	if (storedhideTips && storedhideTips === 'true') {
		hideTips.set(true);
	} else {
		hideTips.set(false);
	}

	const storedUserInfo = localStorage.getItem('UserInfo');
	if (storedUserInfo) {
		UserInfo.set(JSON.parse(storedUserInfo));
	}

	recentlyPlayedManager.load();
}

let statsReady = false;
const loadStats = async () => {
	if (!browser) return;
	const stored = await OPFS.getStats();
	if (stored) {
		stats.set(stored);
	}
	statsReady = true;
};
loadStats();

stats.subscribe((value) => {
	if (browser && statsReady) {
		OPFS.saveStats(value);
	}
});

friends.subscribe((value) => {
	statsManager.setFriendsCount(value.length);
});
