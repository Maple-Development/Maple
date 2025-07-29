<script lang="ts">
	import { onMount } from 'svelte';
	import { Menu, MenuItem } from 'm3-svelte';

	const CONTEXT_MENU_EVENT = 'track-context-menu-open';

	let pos = $state({ x: 0, y: 0 });
	let menu = $state({ h: 0, w: 0 });
	let browser = $state({ h: 0, w: 0 });
	let showMenu = $state(false);
	let content: HTMLDivElement | undefined = $state(undefined);

	let playlists = $state<any[]>([]);
	let { type = 'track' }: { type?: string } = $props();

	onMount(() => {
		const handleOtherMenuOpen = (e: CustomEvent) => {
			if (e.detail !== content) {
				showMenu = false;
			}
		};

		window.addEventListener(CONTEXT_MENU_EVENT, handleOtherMenuOpen as EventListener);
		
		return () => {
			window.removeEventListener(CONTEXT_MENU_EVENT, handleOtherMenuOpen as EventListener);
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
	}

	function handleRemove() {
		console.log('Remove clicked');
		showMenu = false;
	}

	function handleAddToPlaylist(playlist?: any) {
		console.log('Add to playlist clicked', playlist);
		showMenu = false;
	}
</script>

{#if showMenu}
	<div
		bind:this={content}
		use:getContextMenuDimension
		style="position: fixed; top: {pos.y}px; left: {pos.x}px; z-index: 1000;"
	>
    <Menu>
        <MenuItem click={handleDelete}>
            <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/></svg>
            Delete
        </MenuItem>
        <MenuItem click={handleAddToPlaylist}>
            <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-4h4v-2h-4V7h-2v4H7v2h4zm1 5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
            Add to Playlist
        </MenuItem>
    </Menu>
	</div>
{/if}

<svelte:window on:click={onPageClick} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex flex-col w-full mt-5 ml-10" oncontextmenu={rightClickContextMenu}>
    <img 
        src="https://raw.githubusercontent.com/Cattn/Maple/8c1ab06960d3cec36714bf99cd6cee4ebb53913a/static/temp/MapleD.svg" 
        class="h-44 w-44 object-cover rounded-lg md:h-52 md:w-52 cursor-pointer transition-all duration-300 ease-in-out hover:scale-102 hover:shadow-lg active:scale-98 select-none"
        alt="Song Art"
        draggable="false"
    />
    <div class="flex flex-col">
        <p class="song-titles mt-2">Song Title</p>
        <p class="song-artists">Artist Name</p>
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