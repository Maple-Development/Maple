<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import type { Album } from '$lib/types/album';
	import { ArrowUpAZ, ArrowDownZA, ListFilter, List, EllipsisVertical } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import { title, isSmallDevice } from '$lib/store';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	// @ts-ignore
	import Lazy from 'svelte-lazy';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let albums: Album[] = [];

	onMount(async () => {
		albums = (await OPFS.get().albums()).sort((a, b) => a.name.localeCompare(b.name));
		title.set('Albums');
	});

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		return URL.createObjectURL(blob);
	}

	let sort = 'title';
	let ascending = true;
	let listType = 'grid';

	async function sortAlbums(s: string) {
		sort = s;
		if (s === 'title') {
			albums = albums.sort((a, b) =>
				ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
			); // idk why I choose name instead of title but yeah
		} else if (s === 'artist') {
			albums = albums.sort((a, b) =>
				ascending ? a.artist.localeCompare(b.artist) : b.artist.localeCompare(a.artist)
			);
		} else if (s === 'year') {
			albums = albums.sort((a, b) => (ascending ? a.year - b.year : b.year - a.year));
		}
	}

	function swapAscending() {
		ascending = !ascending;
		sortAlbums(sort);
	}

	function formatDuration(duration: number): string {
		const roundedDuration = Math.round(duration);
		const minutes = Math.floor(roundedDuration / 60);
		const seconds = roundedDuration % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function swapListType() {
		if (listType === 'list') {
			listType = 'grid';
		} else {
			listType = 'list';
		}
	}

	let isOpenAlert = false;
	let selectedAlbum: Album | null = null;

	function deleteAlbum() {
		if (selectedAlbum) {
			OPFS.artist().delete(selectedAlbum);
			toast.success(`Playlist ${selectedAlbum.name} deleted successfully!`);
			goto('/albums');
		} else {
			console.error('Playlist not found');
		}
	}

	function openAlert(album: Album) {
		selectedAlbum = album;
		isOpenAlert = true;
	}
</script>

<div class="mt-4 flex h-10 w-full justify-center px-10 md:justify-end">
	{#if ascending}
		<Button
			class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
			on:click={() => swapAscending()}
		>
			<ArrowUpAZ size={20} color="white" />
		</Button>
	{:else}
		<Button
			class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
			on:click={() => swapAscending()}
		>
			<ArrowDownZA size={20} color="white" />
		</Button>
	{/if}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild let:builder>
			<Button
				class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
				builders={[builder]}
			>
				<ListFilter size={20} color="white" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Label>Sort By</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.RadioGroup bind:value={sort}>
				<DropdownMenu.RadioItem value="title" on:click={() => sortAlbums('title')}
					>Title</DropdownMenu.RadioItem
				>
				<DropdownMenu.RadioItem value="artist" on:click={() => sortAlbums('artist')}
					>Artist</DropdownMenu.RadioItem
				>
				<DropdownMenu.RadioItem value="year" on:click={() => sortAlbums('year')}
					>Year</DropdownMenu.RadioItem
				>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Button
		class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
		on:click={() => swapListType()}
	>
		<List size={20} color="white" />
	</Button>
</div>

{#if listType !== 'list'}
	<div
		class="my-5 ml-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:ml-16 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
	>
		{#each albums as album}
			<div class="mr-2 flex flex-col items-start">
				{#await getImageUrl(album.image) then image}
					<ContextMenu type={'album'} on:delete={(e) => openAlert(album)}>
						<a class="pointer" href={`/album?album=${album.id}`}>
							<Lazy height={208} keep={true}>
								<img class="h-44 w-44 rounded-sm md:h-52 md:w-52" src={image} alt={album.name} />
							</Lazy>
						</a>
					</ContextMenu>
					<div class="flex flex-row items-start">
						<div class="mt-4 flex h-full flex-col items-start">
							<h1 class="md:text-md p-0 text-lg font-bold leading-none text-foreground">
								{album.name}
							</h1>
							<h1 class="text-slate-40 p-0 text-sm font-light leading-none md:text-base">
								{album.artist}
							</h1>
						</div>
					</div>
				{:catch error}
					<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
				{/await}
			</div>
		{/each}
	</div>
{:else}
	<div class="mx-4 mb-5 mt-2 flex flex-col">
		{#each albums as album}
			<div class="flex w-full">
				<div class="flex-grow">
					<a class="pointer" href={`/album?album=${album.id}`}>
						<div class="flex flex-row items-center rounded-sm px-2 py-2 hover:bg-secondary">
							<div class="h-12 w-12 flex-shrink-0 md:h-24 md:w-24">
								{#await getImageUrl(album.image) then image}
									<Lazy height={208} keep={true}>
										<img class="rounded-md" src={image} alt={album.name} />
									</Lazy>
								{:catch error}
									<div class="mr-4 h-24 w-24 bg-gray-500"></div>
								{/await}
							</div>
							<div class="ml-4 flex flex-grow flex-col items-start">
								<h1 class="text-lg font-bold leading-none text-foreground">{album.name}</h1>
								<h1 class="text-base font-light leading-none text-slate-400">{album.artist}</h1>
							</div>
							{#if !$isSmallDevice}
								<div class="ml-4 flex flex-col items-end text-right">
									<h1 class="text-base font-light leading-none text-slate-400">{album.year}</h1>
									<h1 class="text-base font-light leading-none text-slate-400">{album.artist}</h1>
								</div>
							{/if}
						</div>
					</a>
				</div>
				<div class="ml-2 flex items-center">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button class="h-10 w-10 bg-transparent px-1 hover:bg-secondary" builders={[builder]}>
								<EllipsisVertical size={20} color="white" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Label>Options</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item on:click={() => openAlert(album)}>Delete</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		{/each}
	</div>
{/if}

<AlertDialog.Root bind:open={isOpenAlert}>
	<AlertDialog.Trigger></AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will COMPLETELY delete the playlist, it will NOT remove
				the tracks within the playlist.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={() => deleteAlbum()}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
