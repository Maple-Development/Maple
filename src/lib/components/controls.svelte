<script lang="ts">
	import type { Song } from '$lib/types/song';
	import { OPFS } from '$lib/opfs';
	import { context, activeSong, audioPlayer, recentlyPlayedManager } from '$lib/store';

	let audioUrl: string = '';

	export async function playSong(song: Song) {
		currentTime(0);
		$recentlyPlayedManager.add(song);
		activeSong.set(song);
		const buffer = await OPFS.getSong(song);
		if (buffer) {
			const arrayBuffer = await buffer.arrayBuffer();
			const blob = new Blob([arrayBuffer], { type: `audio/${song.ext}` });
			audioUrl = URL.createObjectURL(blob);
		}
		audioPlayer.update((state) => {
			if (state.audio instanceof HTMLAudioElement) {
				state.audio.src = audioUrl;
				state.audio.play();
				return { ...state, playing: true, onEnded: nextSong };
			} else {
				return state;
			}
		});

		audioPlayer.update((store) => ({
			...store,
			onEnded: nextSong
		}));
	}

	export function nextSong() {
		const index = $context.indexOf($activeSong);
		const nextIndex = (index + 1) % $context.length;
		playSong($context[nextIndex]);
	}

	export function prevSong() {
		const index = $context.indexOf($activeSong);
		const prevIndex = (index - 1 + $context.length) % $context.length;
		playSong($context[prevIndex]);
	}

	export function volume(volume: number) {
		audioPlayer.update((store) => ({
			...store,
			volume: volume,
			changeVolume: true
		}));
	}

	export function currentTime(time: number) {
		audioPlayer.update((store) => ({
			...store,
			currentTime: time
		}));
	}
</script>
