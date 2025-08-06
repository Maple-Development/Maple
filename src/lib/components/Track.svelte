<script lang="ts">
	import { onMount } from 'svelte';
	import type { Song, Playlist } from '$lib/types';
	import { playlists } from '$lib/global.svelte';
	import { OPFS } from '$lib/opfs';
	// @ts-ignore
	import Lazy from 'svelte-lazy';

	const CONTEXT_MENU_EVENT = 'track-context-menu-open';

	let pos = $state({ x: 0, y: 0 });
	let menu = $state({ h: 0, w: 0 });
	let browser = $state({ h: 0, w: 0 });
	let showMenu = $state(false);
	let showPlaylistSubmenu = $state(false);
	let content: HTMLDivElement | undefined = $state(undefined);
	let hideSubmenuTimeout: number | null = null;
	
	let { track, type = 'track' }: { track: Song; type?: string } = $props();

	onMount(() => {
		const handleOtherMenuOpen = (e: CustomEvent) => {
			if (e.detail !== content) {
				showMenu = false;
				showPlaylistSubmenu = false;
				if (hideSubmenuTimeout) {
					clearTimeout(hideSubmenuTimeout);
					hideSubmenuTimeout = null;
				}
			}
		};

		window.addEventListener(CONTEXT_MENU_EVENT, handleOtherMenuOpen as EventListener);
		
		return () => {
			window.removeEventListener(CONTEXT_MENU_EVENT, handleOtherMenuOpen as EventListener);
			if (hideSubmenuTimeout) {
				clearTimeout(hideSubmenuTimeout);
				hideSubmenuTimeout = null;
			}
		};
	});

	function rightClickContextMenu(e: MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();

		window.dispatchEvent(new CustomEvent(CONTEXT_MENU_EVENT, { 
			detail: content 
		}));

		browser = {
			w: window.innerWidth,
			h: window.innerHeight
		};

		pos = {
			x: e.clientX,
			y: e.clientY
		};

		if (browser.h - pos.y < menu.h) pos.y -= menu.h;
		if (browser.w - pos.x < menu.w) pos.x -= menu.w;

		showMenu = false;
		showPlaylistSubmenu = false;
		if (hideSubmenuTimeout) {
			clearTimeout(hideSubmenuTimeout);
			hideSubmenuTimeout = null;
		}
		setTimeout(() => {
			showMenu = true;
		}, 0);
	}

	function onPageClick(e: MouseEvent): void {
		if (!content) return;

		const rect = content.getBoundingClientRect();
		const isOutside =
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom;

		if (isOutside) {
			showMenu = false;
			showPlaylistSubmenu = false;
			if (hideSubmenuTimeout) {
				clearTimeout(hideSubmenuTimeout);
				hideSubmenuTimeout = null;
			}
		}
	}

	function getContextMenuDimension(node: HTMLDivElement): void {
		menu = {
			h: node.offsetHeight,
			w: node.offsetWidth
		};
		content = node;
	}

	function handleDelete() {
		console.log('Delete clicked');
		showMenu = false;
		showPlaylistSubmenu = false;
		if (hideSubmenuTimeout) {
			clearTimeout(hideSubmenuTimeout);
			hideSubmenuTimeout = null;
		}
	}

	function handleRemove() {
		console.log('Remove clicked');
		showMenu = false;
		showPlaylistSubmenu = false;
		if (hideSubmenuTimeout) {
			clearTimeout(hideSubmenuTimeout);
			hideSubmenuTimeout = null;
		}
	}

	function handleAddToPlaylist(playlist?: any) {
		console.log('Add to playlist clicked', playlist);
		showMenu = false;
		showPlaylistSubmenu = false;
		if (hideSubmenuTimeout) {
			clearTimeout(hideSubmenuTimeout);
			hideSubmenuTimeout = null;
		}
	}

	function handlePlaylistHover() {
		if (hideSubmenuTimeout) {
			clearTimeout(hideSubmenuTimeout);
			hideSubmenuTimeout = null;
		}
		showPlaylistSubmenu = true;
	}

	function handlePlaylistLeave() {
		hideSubmenuTimeout = setTimeout(() => {
			showPlaylistSubmenu = false;
			hideSubmenuTimeout = null;
		}, 300);
	}
</script>

{#if showMenu}
	<div
		bind:this={content}
		use:getContextMenuDimension
		style="position: fixed; top: {pos.y}px; left: {pos.x}px; z-index: 1000;"
		class="opacity-100 transform scale-100 transition-all duration-100"
	>
		<div class="bg-surface-container border border-outline rounded-xl shadow-lg py-2 min-w-48">
			<button
				onclick={handleDelete}
				class="w-full flex items-center px-4 py-3 text-on-surface hover:bg-surface-container-high transition-colors duration-150 text-left"
			>
				<svg class="mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
					<path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/>
				</svg>
				<span class="text-sm font-medium">Delete</span>
			</button>

			<div class="relative">
				<button
					onmouseenter={handlePlaylistHover}
					onmouseleave={handlePlaylistLeave}
					class="w-full flex items-center justify-between px-4 py-3 text-on-surface hover:bg-surface-container-high transition-colors duration-150 text-left"
				>
					<div class="flex items-center">
						<svg class="mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
							<path fill="currentColor" d="M11 17h2v-4h4v-2h-4V7h-2v4H7v2h4zm1 5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/>
						</svg>
						<span class="text-sm font-medium">Add to Playlist</span>
					</div>
					<svg class="w-4 h-4 transform transition-transform duration-200 {showPlaylistSubmenu ? 'rotate-90' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z"/>
					</svg>
				</button>

				{#if showPlaylistSubmenu}
					<div
						role="menu"
						tabindex="-1"
						onmouseenter={handlePlaylistHover}
						onmouseleave={handlePlaylistLeave}
						class="absolute left-full top-0 ml-1 bg-surface-container border border-outline rounded-xl shadow-lg py-2 min-w-40 z-50"
					>
						{#each playlists() as playlist}
							<button
								onclick={() => handleAddToPlaylist(playlist)}
								class="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-high transition-colors duration-150"
							>
								{playlist.name}
							</button>
						{/each}
						<hr class="my-2 border-outline-variant">
						<button
							onclick={() => handleAddToPlaylist('new')}
							class="w-full flex items-center px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-high transition-colors duration-150"
						>
							<svg class="mr-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>
							</svg>
							Create New Playlist
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<svelte:window on:click={onPageClick} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex flex-col w-full mt-5 ml-10" oncontextmenu={rightClickContextMenu}>
    {#if track.image}
        {#await OPFS.getImageUrl(track.image)}
			<Lazy height={200} keep={true}>
				<img 
					src="https://raw.githubusercontent.com/Cattn/Maple/8c1ab06960d3cec36714bf99cd6cee4ebb53913a/static/temp/MapleD.svg" 
					class="h-44 w-44 object-cover rounded-lg md:h-52 md:w-52 cursor-pointer transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg active:scale-98 select-none"
					alt="{track.title} - {track.artist}"
					draggable="false"
				/>
			</Lazy>
        {:then imageUrl}
			<Lazy height={200} keep={true}>
				<img 
					src={imageUrl} 
					class="h-44 w-44 object-cover rounded-lg md:h-52 md:w-52 cursor-pointer transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg active:scale-98 select-none"
					alt="{track.title} - {track.artist}"
					draggable="false"
				/>
			</Lazy>
        {:catch}
			<Lazy height={200} keep={true}>
				<img 
					src="https://raw.githubusercontent.com/Cattn/Maple/8c1ab06960d3cec36714bf99cd6cee4ebb53913a/static/temp/MapleD.svg" 
					class="h-44 w-44 object-cover rounded-lg md:h-52 md:w-52 cursor-pointer transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg active:scale-98 select-none"
					alt="{track.title} - {track.artist}"
					draggable="false"
				/>
			</Lazy>
        {/await}
    {:else}
        <img 
            src="https://raw.githubusercontent.com/Cattn/Maple/8c1ab06960d3cec36714bf99cd6cee4ebb53913a/static/temp/MapleD.svg" 
            class="h-44 w-44 object-cover rounded-lg md:h-52 md:w-52 cursor-pointer transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg active:scale-98 select-none"
            alt="{track.title} - {track.artist}"
            draggable="false"
        />
    {/if}
    <div class="flex flex-col">
        <p class="song-titles mt-2">{track.title}</p>
        <p class="song-artists">{track.artist}</p>
    </div>
</div>

<style>
    .song-titles {
		color: var(--color-secondary);
		font-size: 20px;
		font-family: 'Roboto Flex', sans-serif;
		font-weight: 800;
		font-style: normal;
		line-height: 20px;
		font-variation-settings:
			'slnt' 0,
			'wdth' 120,
			'GRAD' 77,
			'XOPQ' 96,
			'XTRA' 468,
			'YOPQ' 75,
			'YTAS' 750,
			'YTDE' -203,
			'YTFI' 728,
			'YTLC' 514,
			'YTUC' 712;
	}

    .song-artists {
		color: var(--color-secondary-fixed);
		font-size: 16px;
		font-family: 'Roboto Flex', sans-serif;
		font-weight: 300;
		font-style: normal;
		line-height: 20px;
		font-variation-settings:
			'slnt' 0,
			'wdth' 100,
			'GRAD' -125,
			'XOPQ' 90,
			'XTRA' 468,
			'YOPQ' 88,
			'YTAS' 750,
			'YTDE' -203,
			'YTFI' 728,
			'YTLC' 514,
			'YTUC' 712;
	}
</style>