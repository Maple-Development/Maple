// Todo: OPFS Wrapper
// import ColorThief from './node_modules/colorthief/dist/color-thief.mjs'
// Create/Manage Dirs
// Create/Manage Files
// Dir Index
// File Index

import { file, dir, write } from 'opfs-tools';
import type { Song } from './types/song';
import type { Album } from './types/album';

export class OPFS {

   public static async initializeLibrary() {
       const paths = ['albums', 'artists', 'tracks', 'playlists', 'config'].map(p => `/${p}`);
       const files = [
           { path: '/playlists/playlists.json', content: '' },
           { path: '/albums/albums.json', content: '' },
           { path: '/artists/artists.json', content: '' },
           { path: '/config/config.json', content: '' }
       ];
   
       await Promise.all([
           ...paths.map(p => dir(p).exists().then(exists => exists ? Promise.resolve() : dir(p).create().then(() => Promise.resolve()))),
           ...files.map(f => file(f.path).exists().then(exists => exists ? Promise.resolve() : write(f.path, f.content))),
       ]);
   }

   public static async addAlbum(album: Album) {
    // Check if album exists, if not, add it
    // If it does, do nothing
   }

   public static async addArtist(name: string) {
    // Check if artist exists, if not, add it
    // If it does, do nothing
   }

   public static async addFile(id: string, file: File) {
    // Check if track exists, if not, add it
    // If it does, do nothing
   }

   public static async addTrack(track: Song) {
    // Check if track exists in tracks.json, if not, add it
    // If it does, do nothing
   }

}