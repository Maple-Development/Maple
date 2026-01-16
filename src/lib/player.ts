import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { OPFS } from '$lib/opfs';
import type { Song } from '$lib/types';
import {
	activeSong,
	audioPlayer,
	context,
	curTime,
	queueState,
	recentlyPlayedManager,
	SavedUser,
	setCurTime,
	socket
} from '$lib/store';
import { statsManager } from '$lib/stats';
import type { QueueSnapshot } from '$lib/store';
import UserSettings from '$lib/preferences/usersettings';

type QueueSourceState = QueueSnapshot['source'];

function updateQueue(items: Song[], index: number, source?: QueueSourceState) {
	queueState.set({
		items,
		currentIndex: index,
		source: source ?? { type: 'custom', id: undefined, label: undefined }
	});
	context.set(items);
}

async function emitNowPlaying(song: Song) {
	const s = get(socket);
	const user = get(SavedUser);
	if (!s || !user?.id) return;
	const formatted = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const payload = {
		title: song.title,
		artist: song.artist,
		album: song.album,
		discord: UserSettings.discord.enabled,
		id: user.id,
		timePlayed: formatted,
		source: 'Web'
	};
	s.emit('nowPlaying', { nowPlaying: payload });
}

async function playAtIndex(index: number) {
	const state = get(queueState);
	if (!state.items.length) return;
	const length = state.items.length;
	const normalized = ((index % length) + length) % length;
	const song = state.items[normalized];
	updateQueue(state.items, normalized, state.source);
	activeSong.set(song);
	statsManager.recordPlay(song, state.source);
	get(recentlyPlayedManager).add(song);
	const buffer = await OPFS.getSong(song);
	if (!buffer) return;
	const arrayBuffer = await buffer.arrayBuffer();
	const blob = new Blob([arrayBuffer], { type: `audio/${song.ext}` });
	const audioUrl = URL.createObjectURL(blob);
	curTime.set(0);
	setCurTime.set(0);
	audioPlayer.update((value) => {
		const audio = value.audio ?? (browser ? new Audio() : null);
		if (audio) {
			audio.src = audioUrl;
			audio.currentTime = 0;
			audio.play();
			return { ...value, audio, playing: true, currentTime: 0, onEnded: next };
		}
		return value;
	});
	await emitNowPlaying(song);
}

export async function startPlayback(
	items: Song[],
	start: Song | string,
	source?: { type?: QueueSourceState['type']; id?: string; label?: string }
) {
	const queue = items.filter(Boolean);
	if (!queue.length) return;
	const startId = typeof start === 'string' ? start : start.id;
	const startIndex = Math.max(
		queue.findIndex((s) => s.id === startId),
		0
	);
	updateQueue(queue.slice(), startIndex, {
		type: source?.type ?? 'custom',
		id: source?.id,
		label: source?.label
	});
	statsManager.recordQueueStart(get(queueState).source, queue.length);
	await playAtIndex(startIndex);
}

export async function next() {
	const state = get(queueState);
	if (!state.items.length) return;
	statsManager.recordSkip();
	await playAtIndex(state.currentIndex + 1);
}

export async function previous() {
	const state = get(queueState);
	if (!state.items.length) return;
	statsManager.recordSkip();
	await playAtIndex(state.currentIndex - 1);
}

export function togglePlay() {
	const state = get(audioPlayer);
	if (state.playing) {
		statsManager.recordPause();
	} else {
		statsManager.recordResume();
	}
	audioPlayer.update((value) => {
		if (value.audio instanceof HTMLAudioElement) {
			if (value.playing) {
				value.audio.pause();
			} else {
				value.audio.play();
			}
			return { ...value, playing: !value.playing, currentTime: value.audio.currentTime };
		}
		return value;
	});
}

export function setVolumeLevel(volume: number) {
	audioPlayer.update((value) => ({ ...value, volume, changeVolume: true }));
}

export function seekTo(time: number) {
	curTime.set(time);
	setCurTime.set(time);
	audioPlayer.update((value) => {
		if (value.audio instanceof HTMLAudioElement) {
			value.audio.currentTime = time;
			return { ...value, currentTime: time };
		}
		return value;
	});
}

export async function playRecent(index = 0) {
	const recent = (get(recentlyPlayedManager).get() as Song[]).filter(Boolean);
	if (!recent.length) return;
	const startIndex = index >= 0 && index < recent.length ? index : 0;
	await startPlayback(recent, recent[startIndex].id, { type: 'recent' });
}

export function setQueueSource(source: QueueSourceState) {
	const state = get(queueState);
	updateQueue(state.items, state.currentIndex, source);
}
