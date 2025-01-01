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
			if ("mediaSession" in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: song.title,
				artist: song.artist,
				album: song.album,
				artwork: [
					{
						src: song.image,
						sizes: "512x512",
						type: song.image.split(";")[0].split(":")[1],
					},
				],
			});

			navigator.mediaSession.setActionHandler("play", () => {
				pausePlay();
			});
			navigator.mediaSession.setActionHandler("pause", () => {
				pausePlay();
			});
			navigator.mediaSession.setActionHandler("seekto", (evt) => {
				if (!evt.seekTime) return;
				console.log(evt.seekTime);
			});
			navigator.mediaSession.setActionHandler("previoustrack", () => {
				prevSong();
			});
			navigator.mediaSession.setActionHandler("nexttrack", () => {
				nextSong();
			});
			}
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

	export function pausePlay() {
		audioPlayer.update((state) => {
			if (state.audio instanceof HTMLAudioElement) {
				if (state.playing) {
					state.audio.pause();
				} else {
					state.audio.play();
				}
				return { ...state, playing: !state.playing, currentTime: state.audio.currentTime };
			} else {
				return state;
			}
		});
	}
</script>
