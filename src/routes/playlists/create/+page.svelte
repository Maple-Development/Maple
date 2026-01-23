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
		<h1 class="text-on-surface text-2xl font-bold">Create Playlist</h1>
		<div class="flex gap-2">
			<button
				class="bg-surface-container-high text-on-surface rounded-lg px-4 py-2"
				onclick={() => goto('/playlists')}
			>
				Cancel
			</button>
			<button class="bg-primary text-on-primary rounded-lg px-4 py-2" onclick={createPlaylist}>
				Save
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="space-y-3">
			<div class="space-y-1">
				<label class="text-on-surface text-sm font-medium" for="playlist-name">Name</label>
				<input
					id="playlist-name"
					class="border-outline bg-surface text-on-surface w-full rounded-lg border px-3 py-2"
					bind:value={name}
					placeholder="Playlist name"
				/>
			</div>

			<div class="space-y-1">
				<label class="text-on-surface text-sm font-medium" for="playlist-description"
					>Description</label
				>
				<input
					id="playlist-description"
					class="border-outline bg-surface text-on-surface w-full rounded-lg border px-3 py-2"
					bind:value={description}
					placeholder="Playlist description"
				/>
			</div>

			<div class="space-y-1">
				<label class="text-on-surface text-sm font-medium" for="playlist-photo">Image</label>
				<input id="playlist-photo" type="file" accept="image/*" onchange={handlePhotoChange} />
			</div>

			<img
				src={imagePreviewUrl}
				alt="Playlist preview"
				class="border-outline h-52 w-52 rounded-lg border object-cover"
				draggable="false"
			/>

			<div class="text-on-surface-variant text-sm">
				Selected: {selectedTrackIds.length}
			</div>
		</div>

		<div class="space-y-3">
			<div class="space-y-1">
				<label class="text-on-surface text-sm font-medium" for="track-search">Search tracks</label>
				<input
					id="track-search"
					class="border-outline bg-surface text-on-surface w-full rounded-lg border px-3 py-2"
					bind:value={searchQuery}
					oninput={filterTracks}
					placeholder="Title / Artist / Album"
				/>
			</div>

			<ul class="max-h-[60vh] space-y-2 overflow-auto pr-1">
				{#each filteredTracks as song (song.id)}
					<li>
						<button
							class="border-outline hover:bg-surface-container-high w-full rounded-lg border px-3 py-2 text-left"
							onclick={() => toggleSongSelection(song)}
						>
							<div class="flex items-center justify-between gap-4">
								<div class="min-w-0">
									<div class="text-on-surface truncate font-semibold">{song.title}</div>
									<div class="text-on-surface-variant truncate text-sm">
										{song.artist} • {song.album}
									</div>
								</div>
								{#if isSelected(song)}
									<div class="text-primary text-sm font-medium">Selected</div>
								{/if}
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
