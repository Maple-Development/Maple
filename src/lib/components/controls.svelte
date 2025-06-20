<script lang="ts">
	import type { Song } from '$lib/types';
	import { OPFS } from '$lib/opfs';
	import { context, activeSong, audioPlayer, recentlyPlayedManager, socket } from '$lib/store';
	import { extractColors } from 'extract-colors';
	import { UserManager } from '$lib/api/UserManager';
	import { SavedUser } from '$lib/store';
	import UserSettings from '$lib/preferences/usersettings';
	import { v4 as uuidv4 } from 'uuid';
	import { refreshFriends, refreshRequests } from '$lib/refreshFriends';

	let audioUrl: string = '';
	let colors: {
		[x: string]: any;
		hex: any;
	}[];

	async function getImage(imagePath: string): Promise<File> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const file = new File([arrayBuffer], imagePath, { type: 'image/jpeg' });
		const tempUrl = URL.createObjectURL(file);
		colors = await extractColors(tempUrl);
		URL.revokeObjectURL(tempUrl);
		return file;
	}

	async function base64ToFile(base64: string): Promise<File> {
		const arrayBuffer = await (await fetch(base64)).arrayBuffer();
		const file = new File([arrayBuffer], 'image.png', { type: 'image/png' });
		return file;
	}

	async function webHookSend(song: Song) {
		const isLoggedIn = await UserManager.isLoggedIn();
		if (!isLoggedIn) return;

		const image = await getImage(song.image);
		const imageBuffer = await image.arrayBuffer();
		const imageFile = new File([imageBuffer], 'album.jpg', { type: 'image/jpeg' });
		await UserManager.setAlbumArt(imageFile);
		await new Promise(resolve => setTimeout(resolve, 100));

		let friendPlaying = {
			title: song.title,
			artist: song.artist,
			album: song.album,
			discord: UserSettings.discord.enabled,
			id: $SavedUser.id
		};

		$socket?.emit('nowPlaying', { nowPlaying: friendPlaying });
		refreshFriends();
		refreshRequests();

		console.log('[CLIENT] Emitting nowPlaying event:', friendPlaying);
		console.log('[CLIENT] Current socket ID:', $socket?.id);

		if (UserSettings.webhook.enabled) {			
			const formData = new FormData();
			formData.append('file', image, 'album.jpg');
			formData.append(
				'payload_json',
				JSON.stringify({
					embeds: [
						{
							title: 'Now Playing',
							description: `**${song.title}** by ${song.artist}`,
							color: parseInt(colors?.[0]?.hex.replace(/^#/, ''), 16),
							fields: [
								{
									name: 'Album',
									value: song.album
								},
								{
									name: 'Year',
									value: song.year ? song.year.toString() : 'N/A'
								},
								{
									name: 'Track Number',
									value: song.trackNumber ? song.trackNumber.toString() : 'N/A'
								}
							],
							image: {
								url: 'attachment://album.jpg'
							}
						}
					],
					username: $SavedUser?.name === '' ? 'Maple User' : $SavedUser?.name,
					avatar_url: 'https://api.maple.music/public/get/pfp/' + $SavedUser?.id
				})
			);

			await fetch(UserSettings.webhook.url, {
				method: 'POST',
				body: formData
			});
		}

		if ('mediaSession' in navigator) {
			const artworkUuid = uuidv4();
			const artworkUrl = 'https://api.maple.music/public/get/albumArt/' + $SavedUser.id + '/' + artworkUuid;
			
			navigator.mediaSession.metadata = new MediaMetadata({
				title: song.title,
				artist: song.artist,
				album: song.album,
				artwork: [
					{
						src: artworkUrl,
						sizes: '512x512',
						type: 'image/jpeg'
					}
				]
			});

			navigator.mediaSession.setActionHandler('play', () => {
				pausePlay();
			});
			navigator.mediaSession.setActionHandler('pause', () => {
				pausePlay();
			});
			navigator.mediaSession.setActionHandler('seekto', (evt) => {
				if (!evt.seekTime) return;
			});
			navigator.mediaSession.setActionHandler('previoustrack', () => {
				prevSong();
			});
			navigator.mediaSession.setActionHandler('nexttrack', () => {
				nextSong();
			});
		}
	}

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

		webHookSend(song);
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
