import { writable } from 'svelte/store';
import type { Song } from '$lib/types';
import type { QueueSnapshot, QueueSource } from '$lib/store';

export type StatsSnapshot = {
	playCount: number;
	secondsListened: number;
	minutesListened: number;
	uniqueSongsPlayed: number;
	queueStarts: number;
	skips: number;
	pauses: number;
	resumes: number;
	friendsCount: number;
	librarySize: number;
	lastPlayedAt: string | null;
	lastQueueSource: QueueSource | 'unknown';
	lastQueueSize: number;
	lastPauseAt: string | null;
	lastLibrarySizeAt: string | null;
	perSongPlayCount: Record<string, number>;
	perArtistPlayCount: Record<string, number>;
	perAlbumPlayCount: Record<string, number>;
	perSourcePlayCount: Record<string, number>;
	perSongSeconds: Record<string, number>;
	perArtistSeconds: Record<string, number>;
	perAlbumSeconds: Record<string, number>;
	perSourceSeconds: Record<string, number>;
	songFirstPlayedAt: Record<string, string>;
	songLastPlayedAt: Record<string, string>;
	dateAdded: Record<string, string>;
	uniqueSongIds: string[];
};

const createDefaultStats = (): StatsSnapshot => ({
	playCount: 0,
	secondsListened: 0,
	minutesListened: 0,
	uniqueSongsPlayed: 0,
	queueStarts: 0,
	skips: 0,
	pauses: 0,
	resumes: 0,
	friendsCount: 0,
	librarySize: 0,
	lastPlayedAt: null,
	lastQueueSource: 'unknown',
	lastQueueSize: 0,
	lastPauseAt: null,
	lastLibrarySizeAt: null,
	perSongPlayCount: {},
	perArtistPlayCount: {},
	perAlbumPlayCount: {},
	perSourcePlayCount: {},
	perSongSeconds: {},
	perArtistSeconds: {},
	perAlbumSeconds: {},
	perSourceSeconds: {},
	songFirstPlayedAt: {},
	songLastPlayedAt: {},
	dateAdded: {},
	uniqueSongIds: []
});

export const stats = writable<StatsSnapshot>(createDefaultStats());

class StatsManager {
	apply(update: (state: StatsSnapshot) => StatsSnapshot) {
		stats.update((state) => update({ ...state }));
	}

	recordPlay(song: Song | null, source?: QueueSnapshot['source']) {
		const now = new Date().toISOString();
		this.apply((state) => {
			state.playCount += 1;
			state.lastPlayedAt = now;
			const sourceType = source?.type ?? 'unknown';
			state.lastQueueSource = sourceType;
			state.perSourcePlayCount = {
				...state.perSourcePlayCount,
				[sourceType]: (state.perSourcePlayCount[sourceType] ?? 0) + 1
			};
			if (song?.id) {
				state.perSongPlayCount = {
					...state.perSongPlayCount,
					[song.id]: (state.perSongPlayCount[song.id] ?? 0) + 1
				};
				state.songLastPlayedAt = { ...state.songLastPlayedAt, [song.id]: now };
				if (!state.songFirstPlayedAt[song.id]) {
					state.songFirstPlayedAt = { ...state.songFirstPlayedAt, [song.id]: now };
				}
				if (!state.uniqueSongIds.includes(song.id)) {
					state.uniqueSongIds = [...state.uniqueSongIds, song.id];
					state.uniqueSongsPlayed = state.uniqueSongIds.length;
				}
			}
			if (song?.artist) {
				state.perArtistPlayCount = {
					...state.perArtistPlayCount,
					[song.artist]: (state.perArtistPlayCount[song.artist] ?? 0) + 1
				};
			}
			if (song?.album) {
				state.perAlbumPlayCount = {
					...state.perAlbumPlayCount,
					[song.album]: (state.perAlbumPlayCount[song.album] ?? 0) + 1
				};
			}
			return state;
		});
	}

	recordListeningSeconds(
		song: Song | null,
		source: QueueSnapshot['source'] | undefined,
		seconds: number
	) {
		if (!Number.isFinite(seconds) || seconds <= 0) return;
		const sourceType = source?.type ?? 'unknown';
		this.apply((state) => {
			state.secondsListened += seconds;
			state.minutesListened = Math.floor(state.secondsListened / 60);
			state.perSourceSeconds = {
				...state.perSourceSeconds,
				[sourceType]: (state.perSourceSeconds[sourceType] ?? 0) + seconds
			};
			if (song?.id) {
				state.perSongSeconds = {
					...state.perSongSeconds,
					[song.id]: (state.perSongSeconds[song.id] ?? 0) + seconds
				};
			}
			if (song?.artist) {
				state.perArtistSeconds = {
					...state.perArtistSeconds,
					[song.artist]: (state.perArtistSeconds[song.artist] ?? 0) + seconds
				};
			}
			if (song?.album) {
				state.perAlbumSeconds = {
					...state.perAlbumSeconds,
					[song.album]: (state.perAlbumSeconds[song.album] ?? 0) + seconds
				};
			}
			return state;
		});
	}

	recordQueueStart(source: QueueSnapshot['source'] | undefined, queueSize: number) {
		this.apply((state) => {
			state.queueStarts += 1;
			state.lastQueueSource = source?.type ?? 'unknown';
			state.lastQueueSize = queueSize;
			return state;
		});
	}

	recordSkip() {
		this.apply((state) => {
			state.skips += 1;
			return state;
		});
	}

	recordPause() {
		const now = new Date().toISOString();
		this.apply((state) => {
			state.pauses += 1;
			state.lastPauseAt = now;
			return state;
		});
	}

	recordResume() {
		this.apply((state) => {
			state.resumes += 1;
			return state;
		});
	}

	recordLibraryAdd(itemId: string, date?: string) {
		const now = date ?? new Date().toISOString();
		this.apply((state) => {
			state.dateAdded = { ...state.dateAdded, [itemId]: now };
			return state;
		});
	}

	setLibrarySize(size: number) {
		const now = new Date().toISOString();
		this.apply((state) => {
			state.librarySize = size;
			state.lastLibrarySizeAt = now;
			return state;
		});
	}

	setFriendsCount(count: number) {
		this.apply((state) => {
			state.friendsCount = count;
			return state;
		});
	}
}

export const statsManager = new StatsManager();
