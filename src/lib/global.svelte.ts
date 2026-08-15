import { OPFS } from './opfs';
import type { Song, Playlist, Artist, Album } from './types';
import { browser } from '$app/environment';
import { toast } from 'svelte-sonner';

let tracksState: Song[] = $state([]);
let playlistsState: Playlist[] = $state([]);
let artistsState: Artist[] = $state([]);
let albumsState: Album[] = $state([]);

async function initialize() {
	await OPFS.requestPersistentStorage();

	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			tracksState = await OPFS.get().tracks();
			playlistsState = await OPFS.get().playlists();
			artistsState = await OPFS.get().artists();
			albumsState = await OPFS.get().albums();

			const expected = OPFS.expectedLibrarySize();
			if (tracksState.length > 0) {
				OPFS.rememberLibrarySize(tracksState.length);
				return;
			}
			if (expected > 0 && attempt < 2) {
				console.warn(`OPFS: library empty on attempt ${attempt + 1}, retrying`);
				await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
				continue;
			}
			if (expected > 0 && tracksState.length === 0) {
				console.error(`OPFS: expected ${expected} tracks but library is empty`);
				toast.error(
					`Library data is missing (${expected} tracks). The browser may have cleared storage — please re-upload.`
				);
			}
			return;
		} catch (error) {
			console.error('Failed to initialize tracks and playlists:', error);
			if (attempt === 2) return;
			await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
		}
	}
}

export async function refreshLibrary() {
	try {
		tracksState = await OPFS.get().tracks();
		playlistsState = await OPFS.get().playlists();
		artistsState = await OPFS.get().artists();
		albumsState = await OPFS.get().albums();
		if (tracksState.length > 0) {
			OPFS.rememberLibrarySize(tracksState.length);
		}
	} catch (error) {
		console.error('Failed to refresh library:', error);
	}
}

if (browser) {
	initialize().catch((error) => {
		console.error('Initialization failed:', error);
	});
}

export const tracks = () => tracksState;
export const playlists = () => playlistsState;
export const artists = () => artistsState;
export const albums = () => albumsState;
