<script lang="ts">
	// Converted to ts by me - Cattn
	// Original code by Github @dukenmarga, July 2022

	import type { Playlist } from '$lib/types/playlist';
	import type { Song } from '$lib/types/song';
	import type { Album } from '$lib/types/album';
	import type { Artist } from '$lib/types/artist';
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let playlists: Playlist[] = [];
	let artists: Artist[] = [];
	let albums: Album[] = [];
	let tracks: Song[] = [];
	export let type: string;
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	onMount(async () => {
		playlists = await OPFS.get().playlists();
		artists = (await OPFS.get().artists()).sort((a, b) => a.name.localeCompare(b.name));
		albums = (await OPFS.get().albums()).sort((a, b) => a.name.localeCompare(b.name));
		tracks = (await OPFS.get().tracks()).sort((a, b) => a.title.localeCompare(b.title));
	});

	// Cursor position on right-click
	let pos = { x: 0, y: 0 };
	// Context menu dimensions (height and width)
	let menu = { h: 0, w: 0 };
	// Browser window dimensions (height and width)
	let browser = { h: 0, w: 0 };
	// State of context menu visibility
	let showMenu = false;
	// State to manage some additional logic
	let mainMenu = false;
	let content: HTMLDivElement;

	/**
	 * Handle right-click to open the context menu
	 */
	function rightClickContextMenu(e: MouseEvent): void {
		e.preventDefault();

		// Calculate browser dimensions
		browser = {
			w: window.innerWidth,
			h: window.innerHeight
		};

		// Update cursor position
		pos = {
			x: e.clientX,
			y: e.clientY
		};

		// Adjust position if context menu goes out of bounds
		if (browser.h - pos.y < menu.h) pos.y -= menu.h;
		if (browser.w - pos.x < menu.w) pos.x -= menu.w;

		// This forces a re-render
		showMenu = false;
		setTimeout(() => {
			showMenu = true;
		}, 0);
	}

	/**
	 * Handle clicks anywhere on the page to close the context menu
	 */
	function onPageClick(e: MouseEvent): void {
		if (!content) return;

		// Close the menu only if the click is outside its bounds
		const rect = content.getBoundingClientRect();
		const isOutside =
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom;

		if (isOutside) {
			showMenu = false;
		}
	}

	/**
	 * Manage some custom main menu behavior
	 */
	function mainPageClick(e: { clientX: number; clientY: number }): void {
		if (!content) return;
		const rect = content.getBoundingClientRect();
		const isOutside =
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom;

		if (isOutside) {
			showMenu = false;
		}
	}

	/**
	 * Capture and store the dimensions of the context menu
	 */
	function getContextMenuDimension(node: HTMLDivElement): void {
		menu = {
			h: node.offsetHeight,
			w: node.offsetWidth
		};
		content = node;
	}

	function openAlert() {
		dispatch('delete');
	}

	function addTrackToPlaylist(playlist: Playlist) {
		dispatch('addTrackToPlaylist', playlist);
	}

	function openRemove() {
		dispatch('remove');
	}
</script>

{#if showMenu}
	<div
		bind:this={content}
		use:getContextMenuDimension
		style="position: absolute; top: {pos.y}px; left: {pos.x}px"
	>
		<div class="navbar" id="navbar">
			<DropdownMenu.Root bind:open={showMenu}>
				<DropdownMenu.Trigger></DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56 border border-popover-foreground bg-primary-foreground">
					<DropdownMenu.Label>Options</DropdownMenu.Label>
					<DropdownMenu.Separator />
					{#if type == 'playlistTrack'}
						<DropdownMenu.Item on:click={() => openRemove()}>Remove</DropdownMenu.Item>
					{/if}
					<DropdownMenu.Item on:click={() => openAlert()}>Delete</DropdownMenu.Item>
					{#if type == 'track' || type == 'playlistTrack'}
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<span>Add to Playlist</span>
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent side="right" class="bg-primary-foreground">
								{#if playlists.length > 0}
									{#each playlists as playlist}
										<DropdownMenu.Item on:click={() => addTrackToPlaylist(playlist)}>
											<span>{playlist.name}</span>
										</DropdownMenu.Item>
									{/each}
								{:else}
									<DropdownMenu.Item disabled>
										<span>No Playlists</span>
									</DropdownMenu.Item>
								{/if}
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
					{/if}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
{/if}

<svelte:window on:click={onPageClick} on:contextmenu={mainPageClick} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:contextmenu|preventDefault={rightClickContextMenu}>
	<slot />
</div>

<style>
	* {
		padding: 0;
		margin: 0;
	}
</style>
