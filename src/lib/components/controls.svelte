<script lang="ts">
	import type { Song } from '$lib/types/song';
	import { OPFS } from '$lib/opfs';
	import { context, activeSong, audioPlayer } from '$lib/store';

	let audioUrl: string = '';

	export async function playSong(song: Song) {
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
			}
			return { ...state, playing: true, onEnded: nextSong };
		});

		audioPlayer.update((store) => ({
			...store,
			onEnded: nextSong
		}));
	}

	export function nextSong() {
		console.log('Track Wrap Next');
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
			volume: volume
		}));
	}
</script>
