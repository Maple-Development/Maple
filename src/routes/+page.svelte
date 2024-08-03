<script lang="ts">
	import { sources, currentSongs, currentArtTile, activeSong, activeArt } from '$lib/store.js';
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
		getExistingFiles();
	})
	import { get, set } from 'idb-keyval';
	

	let importing = false;
	let importLog: any[] = [];
	let mdJson: any[] = [];

	interface FileHandler {
  		processFiles(files: File[]): Promise<void>;
	}

	async function getExistingFiles() {
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

		const dataFolder = await d.getDirectoryHandle('maple.data');
		if (!dataFolder) {
			return;
		}
		const playlistFolder = await dataFolder.getDirectoryHandle('playlist.data');
		const playlistData = await playlistFolder.getFileHandle('playlist.md');
		const artFolder = await dataFolder.getDirectoryHandle('art.data');
		const artData = await artFolder.getFileHandle('art.md');

		if (!playlistData || !artData) {
			return;
		}
		const contents1 = await playlistData.getFile();
		if (!contents1) {
			return;
		}
		const contents = await contents1.text();
		const json = JSON.parse(contents);
		$currentSongs = json;
		console.log($currentSongs);


		const contents2 = await artData.getFile();
		const contents3 = await contents2.text();
		const json2 = JSON.parse(contents3);
		$currentArtTile = json2;

		console.log($activeArt);
		let test: never[] = []
		$sources.push(test);
	}

	async function getFiles() {
		importing = true;
		const files = await directoryOpen();
		importLog.push('Done!');
		importLog = [...importLog];
		await handleFiles(files);
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
				createArtTile(tags, file.name);
				addCurrentSongsToStore(tags, file.name);
				worker.postMessage(tags);
			};

			
		await fileHandler.processFiles(files);
		await processLocalFile();
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

	async function createArtTile(tags: any, fileName: string) {
		let picture: any;
			const { data, format } = tags.tags.picture;
			let base64String = "";
			for (let i = 0; i < data.length; i++) {
				base64String += String.fromCharCode(data[i]);
			}
			const base64Image = `data:${format};base64,${window.btoa(base64String)}`;
			picture = base64Image;
		const uniqueID = `${tags.tags.genre.replace(/\s+/g, '-')}-${tags.tags.track}-${tags.tags.title.replace(/\s+/g, '-')}`;
		let newArt: Art = {
			id: uniqueID,
			image: picture,
			title: tags.tags.title,
			artist: tags.tags.artist,
			fileName: fileName,
			onClick: () => {},
		};
		
		$currentArtTile = [...$currentArtTile, newArt];
		let test: never[] = []
		$sources.push(test);
	}

	async function addCurrentSongsToStore(tags: any, fileName: string) {
		const uniqueID = `${tags.tags.genre.replace(/\s+/g, '-')}-${tags.tags.track}-${tags.tags.title.replace(/\s+/g, '-')}`;
		importing = false;
		let newSong: Song = {
			id: uniqueID,
			title: tags.tags.title,
			artist: tags.tags.artist,
			album: tags.tags.album,
			year: tags.tags.year,
			genre: tags.tags.genre,
			fileName: fileName,
			onClick: () => {},
			onContextMenu: (e: MouseEvent) => {},
		}

		$currentSongs = [...$currentSongs, newSong];
		let test: never[] = []
		$sources.push(test);
	}

	function removeArt(art: any) {
   		$currentArtTile = $currentArtTile.filter((a) => a.id !== art);
	}

	function setActive(art: any) {
		$activeSong = $currentSongs.filter((a) => a.id === art)[0];
		$activeArt = $currentArtTile.filter((a) => a.id === art)[0];
	}

	async function processLocalFile() {
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

		const artFolder = await dataFolder.getDirectoryHandle('art.data', {
	  		create: true,
		});

		const playlistFolder = await dataFolder.getDirectoryHandle('playlist.data', {
				create: true,
		});
		const playlistData = await playlistFolder.getFileHandle('playlist.md', {
      		create: true,
    	});

		playlistData.createWritable().then((writable: { write: (arg0: string) => void; close: () => void; }) => {
			writable.write(JSON.stringify($currentSongs));
			writable.close();
		});

		const artData = await artFolder.getFileHandle('art.md', {
	  		create: true,
		});

		artData.createWritable().then((writable: { write: (arg0: string) => void; close: () => void; }) => {
			writable.write(JSON.stringify($currentArtTile));
			writable.close();
		});
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
		<div class="mx-10 mt-6 flex justify-center rounded-lg">		
			<div>
				<h1 class="scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">
					{$currentArtTile.length} Songs Found
				</h1>
				<div class="flex flex-wrap -mx-4">
					
					{#each $currentArtTile as art}
							<div class="flex-shrink-0 md:w-1/2 lg:w-1/4">
								<ContextMenu.Root>
									<ContextMenu.Trigger><ArtTile
										art={art.image}
										onClick={() => {}}
										title={art.title}
									/></ContextMenu.Trigger>
									<ContextMenu.Content>
									  <ContextMenu.Item on:click={() => setActive(art.id)}>Set Active</ContextMenu.Item>
									  <ContextMenu.Item>More Info</ContextMenu.Item>
									  <ContextMenu.Item on:click={() => removeArt(art.id)}>Remove</ContextMenu.Item>
									</ContextMenu.Content>
								</ContextMenu.Root>
							</div>
					{/each}
				 
				</div>
			</div>
		</div>
	{/if}
{/if}


