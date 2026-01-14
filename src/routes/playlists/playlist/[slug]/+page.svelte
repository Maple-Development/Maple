<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Playlist, Song } from '$lib/types';
	import { OPFS } from '$lib/opfs';
	import { refreshLibrary, tracks } from '$lib/global.svelte';
	import { title } from '$lib/store';

	let { data }: { data: { playlistId: string } } = $props();

	let playlist = $state<Playlist | null>(null);
	let editModeOn = $state(false);
	let changedName = $state('');
	let changedDescription = $state('');
	let imageFile = $state<Blob | null>(null);

	let allTracks = $state<Song[]>([]);
	let searchQuery = $state('');
	let filteredTracks = $state<Song[]>([]);
	let selectedToAdd = $state<string[]>([]);

	async function loadPlaylist() {
		playlist = (await OPFS.get().playlist(data.playlistId)) ?? null;
		if (playlist) {
			if (!playlist.tracks) playlist.tracks = [];
			changedName = playlist.name;
			changedDescription = playlist.description;
			title.set(playlist.name);
		}
	}

	function handlePhotoChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			imageFile = file;
		}
	}

	function filterTracks() {
		const q = searchQuery.trim().toLowerCase();
		const existing = new Set((playlist?.tracks ?? []) as string[]);
		const base = allTracks.filter((t) => !existing.has(t.id));
		if (!q) {
			filteredTracks = base;
			return;
		}
		filteredTracks = base.filter(
			(song) =>
				song.title.toLowerCase().includes(q) ||
				song.artist.toLowerCase().includes(q) ||
				song.album.toLowerCase().includes(q)
		);
	}

	function toggleAdd(song: Song) {
		if (selectedToAdd.includes(song.id)) {
			selectedToAdd = selectedToAdd.filter((id) => id !== song.id);
			return;
		}
		selectedToAdd = [...selectedToAdd, song.id];
	}

	function isAddSelected(song: Song) {
		return selectedToAdd.includes(song.id);
	}

	function resolvePlaylistTracks(): Song[] {
		const ids = new Set((playlist?.tracks ?? []) as string[]);
		return tracks().filter((t) => ids.has(t.id));
	}

	async function saveDetails() {
		if (!playlist) return;
		const updated: Playlist = {
			...playlist,
			name: changedName.trim() || playlist.name,
			description: changedDescription.trim(),
			image: imageFile ?? playlist.image,
			tracks: playlist.tracks ?? []
		};
		await OPFS.playlist().edit(updated);
		await refreshLibrary();
		await loadPlaylist();
		editModeOn = false;
		imageFile = null;
		filterTracks();
	}

	async function deletePlaylist() {
		if (!playlist) return;
		await OPFS.playlist().delete(playlist);
		await refreshLibrary();
		goto('/playlists');
	}

	async function addSelectedTracks() {
		if (!playlist) return;
		const next = Array.from(new Set([...(playlist.tracks ?? []), ...selectedToAdd]));
		const updated: Playlist = { ...playlist, tracks: next };
		await OPFS.playlist().edit(updated);
		await refreshLibrary();
		selectedToAdd = [];
		await loadPlaylist();
		filterTracks();
	}

	async function removeTrackAt(index: number) {
		if (!playlist) return;
		await OPFS.playlist().remove(playlist, index);
		await refreshLibrary();
		await loadPlaylist();
		filterTracks();
	}

	onMount(async () => {
		await refreshLibrary();
		allTracks = [...tracks()].sort((a, b) => a.title.localeCompare(b.title));
		await loadPlaylist();
		filterTracks();
	});
</script>

<div class="mx-24 my-8 space-y-6">
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			{#if editModeOn}
				<input
					class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface text-xl font-bold"
					bind:value={changedName}
				/>
			{:else}
				<h1 class="text-2xl font-bold text-on-surface">{playlist?.name}</h1>
			{/if}
			{#if editModeOn}
				<input
					class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface"
					bind:value={changedDescription}
				/>
			{:else}
				<p class="text-on-surface-variant">{playlist?.description}</p>
			{/if}
		</div>

		<div class="flex gap-2">
			<button class="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface" onclick={() => goto('/playlists')}>
				Back
			</button>
			<button class="px-4 py-2 rounded-lg bg-error text-on-error" onclick={deletePlaylist}>
				Delete
			</button>
			{#if editModeOn}
				<button class="px-4 py-2 rounded-lg bg-primary text-on-primary" onclick={saveDetails}>
					Save
				</button>
			{:else}
				<button class="px-4 py-2 rounded-lg bg-primary text-on-primary" onclick={() => (editModeOn = true)}>
					Edit
				</button>
			{/if}
		</div>
	</div>

	{#if editModeOn}
		<div class="space-y-2">
			<label class="text-sm font-medium text-on-surface" for="playlist-photo">Change image</label>
			<input id="playlist-photo" type="file" accept="image/*" onchange={handlePhotoChange} />
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="space-y-3">
			<h2 class="text-lg font-semibold text-on-surface">Tracks</h2>
			<ul class="space-y-2">
				{#each resolvePlaylistTracks() as t, idx (t.id)}
					<li class="flex items-center justify-between gap-4 rounded-lg border border-outline px-3 py-2">
						<div class="min-w-0">
							<div class="truncate font-semibold text-on-surface">{t.title}</div>
							<div class="truncate text-sm text-on-surface-variant">{t.artist} • {t.album}</div>
						</div>
						<button class="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface" onclick={() => removeTrackAt(idx)}>
							Remove
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<div class="space-y-3">
			<h2 class="text-lg font-semibold text-on-surface">Add tracks</h2>
			<input
				class="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface"
				bind:value={searchQuery}
				oninput={filterTracks}
				placeholder="Search"
			/>
			<div class="flex items-center justify-between text-sm text-on-surface-variant">
				<span>{selectedToAdd.length} selected</span>
				<button class="px-4 py-2 rounded-lg bg-primary text-on-primary" onclick={addSelectedTracks}>
					Add Selected
				</button>
			</div>
			<ul class="space-y-2 max-h-[60vh] overflow-auto pr-1">
				{#each filteredTracks as song (song.id)}
					<li>
						<button
							class="w-full text-left rounded-lg border border-outline px-3 py-2 hover:bg-surface-container-high"
							onclick={() => toggleAdd(song)}
						>
							<div class="flex items-center justify-between gap-4">
								<div class="min-w-0">
									<div class="truncate font-semibold text-on-surface">{song.title}</div>
									<div class="truncate text-sm text-on-surface-variant">{song.artist} • {song.album}</div>
								</div>
								{#if isAddSelected(song)}
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
