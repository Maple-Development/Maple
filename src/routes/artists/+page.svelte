<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import type { Artist } from '$lib/types/artist';
	import { ArrowUpAZ, ArrowDownZA, ListFilter } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { context, title } from '$lib/store';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let artists: Artist[] = [];

	onMount(async () => {
		artists = (await OPFS.get().artists()).sort((a, b) => a.name.localeCompare(b.name));
		title.set('Artists');
	});

	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		if (blob && blob.size === 0) {
			return '';
		}
		return URL.createObjectURL(blob);
	}

	let sort = 'name';
	let ascending = true;

	async function sortArtists(s: string) {
		sort = s;
		if (s === 'name') {
			artists = artists.sort((a, b) =>
				ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
			);
		}
	}

	function swapAscending() {
		ascending = !ascending;
		sortArtists(sort);
	}

	let isOpenAlert = false;
	let selectedArtist: Artist | null = null;

	function deleteArtist() {
		if (selectedArtist) {
			OPFS.artist().delete(selectedArtist);
			toast.success(`Playlist ${selectedArtist.name} deleted successfully!`);
			goto('/artists');
		} else {
			console.error('Playlist not found');
		}
	}

	function openAlert(artist: Artist) {
		selectedArtist = artist;
		isOpenAlert = true;
	}
</script>

<div class="mt-4 flex h-10 w-full justify-end px-10">
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
				<DropdownMenu.RadioItem value="name" on:click={() => sortArtists('name')}
					>Name</DropdownMenu.RadioItem
				>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<div
	class="my-5 ml-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 md:ml-16 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 xl:grid-cols-5 xl:gap-x-12"
>
	{#each artists as artist}
		<div class="mr-2 flex flex-col items-start">
			{#await getImageUrl(artist.image) then image}
				<ContextMenu type={'artist'} on:delete={(e) => openAlert(artist)}>
					<a class="pointer" href={`/artist?artist=${artist.id}`}>
						{#if image !== ''}
							<img class="h-44 w-44 rounded-[50%] md:h-52 md:w-52" src={image} alt={artist.name} />
						{:else}
							<div class="h-44 w-44 animate-pulse rounded-[50%] bg-gray-500 md:h-52 md:w-52"></div>
						{/if}
					</a>
				</ContextMenu>
				<div class="flex flex-row items-start">
					<div class="mt-4 flex h-full flex-col items-start">
						<h1 class="mb-1 text-lg font-bold leading-none text-foreground">{artist.name}</h1>
					</div>
				</div>
			{:catch error}
				<div class="h-52 w-52 animate-pulse rounded-sm bg-gray-500"></div>
			{/await}
		</div>
	{/each}
</div>

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
			<AlertDialog.Action on:click={() => deleteArtist()}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
