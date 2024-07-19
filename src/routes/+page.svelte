<script lang="ts">
	import { sources, currentSongs, currentArtTile } from '$lib/store.js';
	import MusicTile from '$lib/components/MusicTile.svelte';
	import { loadScript } from './document.js';
	import * as Comlink from 'comlink';
	import { onMount } from 'svelte';
	import type { Song } from '$lib/song';
	import type { Art } from '$lib/art';
	import ArtTile from '$lib/components/ArtTile.svelte';
	import * as ContextMenu from "$lib/components/ui/context-menu";
	import {
		fileOpen,
		directoryOpen,
		fileSave,
		supported,
  	} from 'browser-fs-access';
	onMount(() => {
		loadScript('/libraries/jsmediatags.min.js');	
	})
	import { get, set } from 'idb-keyval';
	

	let importing = false;
	let importLog: any[] = [];

	interface FileHandler {
  		processFiles(files: File[]): Promise<void>;
	}

	async function getFiles() {
		importing = true;
		const files = await directoryOpen();
		importLog.push('Done!');
		importLog = [...importLog];
		await createDataFolder();
		await handleFiles(files);
	}

	async function createDataFolder() {
		const fileHandleOrUndefined = await get('file');
    	let d;
		if (fileHandleOrUndefined) {
			console.log(fileHandleOrUndefined);
			d = fileHandleOrUndefined;
		} else {
			// @ts-ignore
			d = await window.showDirectoryPicker();
			await set('file', d);
		}

		const dataFolder = await d.getDirectoryHandle('maple.data', {
      		create: true,
    	});
		const playlistFolder = await dataFolder.getDirectoryHandle(
			'playlist.data',
			{
				create: true,
			}
    	);
		const playlistData = await playlistFolder.getFileHandle('playlist.md', {
      		create: true,
    	});
		
		importLog.push('Creating Data Folder...');
		return;
	}

	async function handleFiles(files: any) {
		importLog.push('Processing Files...');
		importLog = [...importLog];
		importLog.push('Reading Files...');
		importLog = [...importLog];
		
		const worker = new Worker("src/routes/library.worker.js", { type: 'module' });
		const fileHandler = Comlink.wrap<FileHandler>(worker);

			worker.onmessage = async function(e) {
				let file = e.data.content;
				let tags = await processTags(file);
				createArtTile(tags);
				worker.postMessage(tags);
			};

			
		await fileHandler.processFiles(files);
		importLog.push('Finished!');
		importLog = [...importLog];
		
	}

	async function processTags(file: any) {
		try {
			const tags = await new Promise((resolve, reject) => {
				window.jsmediatags.read(file, {
					onSuccess: resolve,
					onError: reject,
				});
			});
			return tags;
		} catch (error) {
			importLog.push('1 File Failed to Process(?)');
			importLog = [...importLog];
			console.log(error);
		}
	}

	async function createArtTile(tags: any) {
		let picture: any;
			const { data, format } = tags.tags.picture;
			let base64String = "";
			for (let i = 0; i < data.length; i++) {
				base64String += String.fromCharCode(data[i]);
			}
			const base64Image = `data:${format};base64,${window.btoa(base64String)}`;
			picture = base64Image;
			console.log(picture);
		let newArt: Art = {
			image: picture,
			onClick: () => {},
		};
		
		$currentArtTile = [...$currentArtTile, newArt];
		let test: never[] = []
		$sources.push(test);
	}

	async function addCurrentSongsToStore(tags: any) {
		let picture: any;
		if (tags.tags.picture) {
			const { data, format } = tags.tags.picture;
			let base64String = "";
			for (let i = 0; i < data.length; i++) {
				base64String += String.fromCharCode(data[i]);
			}
			const base64Image = `data:${format};base64,${window.btoa(base64String)}`;
			picture = base64Image;
		}
		importing = false;
		let newSong: Song = {
			title: tags.tags.title,
			artist: tags.tags.artist,
			album: tags.tags.album,
			year: tags.tags.year,
			art: "",
			genre: tags.tags.genre,
			onClick: () => {},
			onContextMenu: (e: MouseEvent) => {},
		}

		$currentSongs = [...$currentSongs, newSong];
		let test: never[] = []
		$sources.push(test);
	}
</script>

{#if $sources.length == 0}
	<h1 class="mt-4 scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">
		Add a Library
	</h1>
	<p class="mt-1 text-center text-sm text-muted-foreground">
		Select a folder containing your music.
	</p>
	<div class="mt-2 flex justify-center">
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label
			on:click={() => {
				getFiles();
			}}
			class="cursor-pointer rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
		>
			<span class="transition-colors duration-200 ease-in-out">Select Library</span>
		</label>
	</div>

	{#if importing}
		<div class="mx-24 mt-6 flex justify-center rounded-lg">
			<div>
				<h1 class="scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">Log</h1>
				<p class="mt-3 text-center text-muted-foreground">Importing...</p>
				{#each importLog as log}
					<p class="mt-1 text-center text-muted-foreground">{log}</p>
				{/each}
			</div>
		</div>
	{/if}
{:else}
	<!-- {#if $currentSongs.length == 0}
		<h1 class="mt-4 scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl"> Error, no music found </h1>
	{:else}
		<div class="mx-24 mt-6 flex justify-center rounded-lg border border-gray-300">
			<div>
				<h1 class="scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">
					{$currentSongs.length} songs found
				</h1>
				{#each $currentSongs as song}
					<MusicTile
						image={song.art}
						title={song.title}
						artist={song.artist}
						album={song.album}
						onClick={() => {}}
						onContextMenu={() => {}}
					/>
				{/each}
			</div>
		</div>
	{/if} -->

	{#if $currentArtTile.length < 1 && $currentSongs.length == 0}
		<h1 class="mt-4 scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl"> Error, no art found </h1>
	{:else}
		<div class="mx-24 mt-6 flex justify-center rounded-lg border border-gray-300 px-4">		
			<div>
				<h1 class="scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">
					{$currentArtTile.length} Songs Found
				</h1>
				<div class="flex flex-wrap -mx-4">
					<ContextMenu.Root>
					{#each $currentArtTile as art}
							<div class="flex-shrink-0 md:w-1/2 lg:w-1/4 px-4 mb-4">
								
									<ContextMenu.Trigger><ArtTile
										art={art.image}
										onClick={() => {}}
									/></ContextMenu.Trigger>
									<ContextMenu.Content>
									  <ContextMenu.Item>Profile</ContextMenu.Item>
									  <ContextMenu.Item>Billing</ContextMenu.Item>
									  <ContextMenu.Item>Team</ContextMenu.Item>
									  <ContextMenu.Item>Subscription</ContextMenu.Item>
									</ContextMenu.Content>
								 
							</div>
					{/each}
				 </ContextMenu.Root>
				</div>
			</div>
		</div>
	{/if}
{/if}


