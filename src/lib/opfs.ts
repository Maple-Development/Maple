// Todo: OPFS Wrapper

// Create/Manage Dirs
// Create/Manage Files
// Dir Index
// File Index

import { file, dir, write } from 'opfs-tools';

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

}