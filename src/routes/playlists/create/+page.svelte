<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { v4 as uuidv4 } from 'uuid';
	import type { Playlist, Song } from '$lib/types';
	import { OPFS } from '$lib/opfs';
	import { refreshLibrary, tracks } from '$lib/global.svelte';
	import { title } from '$lib/store';

	let name = $state('My Playlist');
	let description = $state('A playlist I just made!');
	let imageFile = $state<Blob | null>(null);
	let imagePreviewUrl = $state<string>('/placeholder.png');

	let allTracks = $state<Song[]>([]);
	let searchQuery = $state('');
	let filteredTracks = $state<Song[]>([]);

	let selectedTrackIds = $state<string[]>([]);

	async function loadPlaceholderImage(): Promise<Blob> {
		const res = await fetch('/placeholder.png');
		return await res.blob();
	}

	function handlePhotoChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			imageFile = file;
			const nextUrl = URL.createObjectURL(file);
			if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
			imagePreviewUrl = nextUrl;
		} else {
			imageFile = null;
			if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
			imagePreviewUrl = '/placeholder.png';
		}
	}

	function filterTracks() {
		const q = searchQuery.trim().toLowerCase();
		if (!q) {
			filteredTracks = allTracks;
			return;
		}
		filteredTracks = allTracks.filter(
			(song) =>
				song.title.toLowerCase().includes(q) ||
				song.artist.toLowerCase().includes(q) ||
				song.album.toLowerCase().includes(q)
		);
	}

	function toggleSongSelection(song: Song) {
		if (selectedTrackIds.includes(song.id)) {
			selectedTrackIds = selectedTrackIds.filter((id) => id !== song.id);
			return;
		}
		selectedTrackIds = [...selectedTrackIds, song.id];
	}

	function isSelected(song: Song) {
		return selectedTrackIds.includes(song.id);
	}

	async function createPlaylist() {
		const id = uuidv4();
		const image = imageFile ?? (await loadPlaceholderImage());
		const now = Date.now();
		const playlist: Playlist = {
			id,
			name: name.trim() || 'My Playlist',
			description: description.trim(),
			tracks: selectedTrackIds,
			image,
			createdAt: now,
			modifiedAt: now
		};
		await OPFS.addPlaylist(playlist);
		await refreshLibrary();
		goto(`/playlists/playlist/${id}`);
	}

	onMount(async () => {
		title.set('Create Playlist');
		await refreshLibrary();
		allTracks = [...tracks()].sort((a, b) => a.title.localeCompare(b.title));
		filteredTracks = allTracks;

		const params = new URLSearchParams($page.url.search);
		const addTrack = params.get('addTrack');
		if (addTrack && allTracks.some((t) => t.id === addTrack)) {
			selectedTrackIds = Array.from(new Set([...selectedTrackIds, addTrack]));
		}

		const addAlbum = params.get('addAlbum');
		if (addAlbum) {
			const album = await OPFS.get().album(addAlbum);
			if (album?.tracks?.length) {
				const albumTrackIds = (album.tracks ?? []) as unknown as string[];
				const valid = albumTrackIds.filter((id) => allTracks.some((t) => t.id === id));
				selectedTrackIds = Array.from(new Set([...selectedTrackIds, ...valid]));
			}
		}
	});

	$effect(() => {
		return () => {
			if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	});
</script>

<div class="mx-24 my-8 space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-on-surface">Create Playlist</h1>
		<div class="flex gap-2">
			<button class="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface" onclick={() => goto('/playlists')}>
				Cancel
			</button>
			<button class="px-4 py-2 rounded-lg bg-primary text-on-primary" onclick={createPlaylist}>
				Save
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="space-y-3">
			<div class="space-y-1">
				<label class="text-sm font-medium text-on-surface" for="playlist-name">Name</label>
				<input
					id="playlist-name"
					class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface"
					bind:value={name}
					placeholder="Playlist name"
				/>
			</div>

			<div class="space-y-1">
				<label class="text-sm font-medium text-on-surface" for="playlist-description">Description</label>
				<input
					id="playlist-description"
					class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface"
					bind:value={description}
					placeholder="Playlist description"
				/>
			</div>

			<div class="space-y-1">
				<label class="text-sm font-medium text-on-surface" for="playlist-photo">Image</label>
				<input id="playlist-photo" type="file" accept="image/*" onchange={handlePhotoChange} />
			</div>

			<img
				src={imagePreviewUrl}
				alt="Playlist preview"
				class="h-52 w-52 rounded-lg object-cover border border-outline"
				draggable="false"
			/>

			<div class="text-sm text-on-surface-variant">
				Selected: {selectedTrackIds.length}
			</div>
		</div>

		<div class="space-y-3">
			<div class="space-y-1">
				<label class="text-sm font-medium text-on-surface" for="track-search">Search tracks</label>
				<input
					id="track-search"
					class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface"
					bind:value={searchQuery}
					oninput={filterTracks}
					placeholder="Title / Artist / Album"
				/>
			</div>

			<ul class="space-y-2 max-h-[60vh] overflow-auto pr-1">
				{#each filteredTracks as song (song.id)}
					<li>
						<button
							class="w-full text-left rounded-lg border border-outline px-3 py-2 hover:bg-surface-container-high"
							onclick={() => toggleSongSelection(song)}
						>
							<div class="flex items-center justify-between gap-4">
								<div class="min-w-0">
									<div class="truncate font-semibold text-on-surface">{song.title}</div>
									<div class="truncate text-sm text-on-surface-variant">{song.artist} • {song.album}</div>
								</div>
								{#if isSelected(song)}
									<div class="text-sm font-medium text-primary">Selected</div>
								{/if}
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
