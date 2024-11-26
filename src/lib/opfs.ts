// Todo: OPFS Wrapper
// import ColorThief from './node_modules/colorthief/dist/color-thief.mjs'
// Create/Manage Dirs
// Create/Manage Files
// Dir Index
// File Index

import { file, dir, write } from 'opfs-tools';
import type { Song } from '$lib/types/song';
import type { Album } from '$lib/types/album';
import type { Artist } from '$lib/types/artist';
import { toast } from "svelte-sonner";
import { activeSong } from './store';

export class OPFS {
    private static albumsCache: Album[] | null = null;
    private static artistsCache: Artist[] | null = null;
    private static tracksCache: Song[] | null = null;
  
    private static async getCache<T>(path: string, cache: T[] | null): Promise<T[]> {
      if (cache) return cache;
      try {
        const content = await file(path).text();
        const json = JSON.parse(content);
        return Array.isArray(json) ? json : [];
      } catch {
        return [];
      }
    }
  
    private static async writeCache<T>(path: string, cache: T[]): Promise<void> {
      await write(path, JSON.stringify(cache));
    }
  
    public static async initializeLibrary() {
      const paths = ['albums', 'artists', 'tracks', 'playlists', 'config', 'images'].map(p => `/${p}`);
      const files = [
        { path: '/playlists/playlists.json', content: '' },
        { path: '/albums/albums.json', content: '' },
        { path: '/artists/artists.json', content: '' },
        { path: '/config/config.json', content: '' },
        { path: '/tracks/tracks.json', content: '' },
      ];
  
      await Promise.all([
        ...paths.map(p => dir(p).exists().then(exists => exists ? Promise.resolve() : dir(p).create().then(() => Promise.resolve()))),
        ...files.map(f => file(f.path).exists().then(exists => exists ? Promise.resolve() : write(f.path, f.content))),
      ]);
    }

    public static async ifExists(path: string) {
      const exists = await dir(path).exists();
      return exists;
    }
  
    public static async ls(path: string) {
      const files = await dir(path).children();
      return files;
    }

    public static async clearLibrary() {
      toast("Clearing library...");
      const paths = ['albums', 'artists', 'tracks', 'playlists', 'config', 'images'].map(p => `/${p}`);
      await Promise.all(paths.map(p => dir(p).remove().then(() => Promise.resolve())));
      toast('Library cleared');
    }
  
  public static async addAlbum(album: Album, id: string) {
    if (!this.albumsCache) {
      this.albumsCache = await this.getCache('/albums/albums.json', this.albumsCache);
    }
  
    const imageFileName = `${album.id}.image`;
    const imageArrayBuffer = await new Response(album.image).arrayBuffer();
    await write(`/images/${imageFileName}`, imageArrayBuffer);
    album.image = `/images/${imageFileName}`;
  
    if (!album.tracks) {
      album.tracks = [];
    }
    album.tracks.push(id);
  
    if (!this.albumsCache.some((a) => a.name === album.name)) {
      this.albumsCache.push(album);
      await this.writeCache('/albums/albums.json', this.albumsCache);
    } else {
      const existingAlbum = this.albumsCache.find((a) => a.name === album.name);
      if (existingAlbum) {
        if (!existingAlbum.tracks) {
          existingAlbum.tracks = [];
        }
        existingAlbum.tracks.push(id);
        await this.writeCache('/albums/albums.json', this.albumsCache);
      }
    }
  }
   
   public static async addArtist(artist: Artist, id: string, album: string) {
     if (!this.artistsCache) {
       this.artistsCache = await this.getCache('/artists/artists.json', this.artistsCache);
     }
   
     if (!artist.tracks) {
       artist.tracks = [];
     }
     artist.tracks.push(id);
   
     // TODO: FIX
     /* if (!this.artistsCache.some((a) => a.albums?.includes(album))) {
       artist.albums?.push(album);
     } */
   
     if (!this.artistsCache.some((a) => a.name === artist.name)) {
       this.artistsCache.push(artist);
       await this.writeCache('/artists/artists.json', this.artistsCache);
     }
   }
  
    public static async addFile(id: string, file: File, track: Song) {
      const fileContent = await file.arrayBuffer();
      const extension = file.name.split('.').pop();
      await write(`/tracks/${id}.${extension}`, fileContent);
    }
  
    public static async addTrack(track: Song) {
      if (!this.tracksCache) {
        this.tracksCache = await this.getCache('/tracks/tracks.json', this.tracksCache);
      }

      const imageFileName = `${track.id}.image`;
      const imageArrayBuffer = await new Response(track.image).arrayBuffer();
      await write(`/images/${imageFileName}`, imageArrayBuffer);
      const trackWithImagePath = { ...track, image: `/images/${imageFileName}` };
  
      if (!this.tracksCache.find((t) => t.title === track.title && t.artist === track.artist)) {
        this.tracksCache.push(trackWithImagePath);
        await this.writeCache('/tracks/tracks.json', this.tracksCache);
      }
    }

    public static async play(track: Song) {
      activeSong.set(track);
    }

    public static get = () => ({
      tracks: async () => { 
        if (!this.tracksCache) {
          this.tracksCache = await this.getCache('/tracks/tracks.json', this.tracksCache);
        }
        return this.tracksCache;
      },

      track: async (id: string) => {
        if (!this.tracksCache) {
          this.tracksCache = await this.getCache('/tracks/tracks.json', this.tracksCache);
        }
        return this.tracksCache.find((t) => t.id === id);
      },

      albums: async () => {
        if (!this.albumsCache) {
          this.albumsCache = await this.getCache('/albums/albums.json', this.albumsCache);
        }
        return this.albumsCache;
      },

      album: async (id: string) => {
        if (!this.albumsCache) {
          this.albumsCache = await this.getCache('/albums/albums.json', this.albumsCache);
        }
        return this.albumsCache.find((a) => a.id === id);
      },

      artists: async () => {
        if (!this.artistsCache) {
          this.artistsCache = await this.getCache('/artists/artists.json', this.artistsCache);
        }
        return this.artistsCache;
      },

      image: async (image: string) => {
        const imageArrayBuffer = await file(`${image}`).arrayBuffer();
        return new Response(imageArrayBuffer);
      }
    });
  }