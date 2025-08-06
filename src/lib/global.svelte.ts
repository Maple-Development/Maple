import { OPFS } from "./opfs";
import type { Song, Playlist } from "./types";
import { browser } from "$app/environment";


let tracksState: Song[] = $state([]);
let playlistsState: Playlist[] = $state([]);

async function initialize() {
    try {
        tracksState = await OPFS.get().tracks();
        playlistsState = await OPFS.get().playlists();
    } catch (error) {
        console.error('Failed to initialize tracks and playlists:', error);
    }
}

if (browser) {
    initialize().catch(error => {
        console.error('Initialization failed:', error);
    });
}

export const tracks = () => tracksState;
export const playlists = () => playlistsState;