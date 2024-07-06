<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { sources } from '$lib/store';
	import { loadScript } from './document.js';
	import * as Comlink from 'comlink';
	import { onMount } from 'svelte';
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
		<div class="mx-24 mt-6 flex justify-center rounded-lg border border-gray-300">
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
	<p>loading...</p>
{/if}
