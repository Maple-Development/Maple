<script lang="ts">
	//@ts-nocheck
	import { OPFS } from '$lib/opfs';
	import Button from '$lib/components/ui/button/button.svelte';
	import { parseBlob } from 'music-metadata';
	import type { Song } from '$lib/types/song';
	import type { Album } from '$lib/types/album';
	import type { Artist } from '$lib/types/artist';
	import { v4 as uuidv4 } from 'uuid';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { title } from '$lib/store';

	let errorText = 'LOG will appear here';

	async function createLibrary(mobileFiles: FileList) {
		try {
			await OPFS.initializeLibrary();

			let entries: FileSystemHandle[] = [];
			const input = document.getElementById('files') as HTMLInputElement;

			const handleFiles = async (files: FileList) => {
				let i = 0;
				for (const file of Array.from(files)) {
					if (file.type.startsWith('audio/')) {
						i++;
						toast(`${i} of ${files.length} | Processing ${file.name}`);
						try {
							const metadata = await parseBlob(file);
							const track: Song = {
								id: uuidv4(),
								title: metadata.common.title || file.name.split('.').slice(0, -1).join('.'),
								artist: metadata.common.artist || 'Unknown Artist',
								album: metadata.common.album || 'Unknown Album',
								year: metadata.common.year || 0,
								genre: metadata.common.genre || 'Unknown Genre',
								duration: metadata.format.duration || 0,
								image: metadata.common.picture
									? new Blob([metadata.common.picture[0].data], {
											type: metadata.common.picture[0].format
										})
									: undefined,
								trackNumber: metadata.common.track.no,
								disk: metadata.common.disk.no,
								ext: file.name.split('.').pop()
							};

							const album: Album = {
								id: uuidv4(),
								name: metadata.common.album || 'Unknown Album',
								artist: metadata.common.artist || 'Unknown Artist',
								year: metadata.common.year || 0,
								genre: metadata.common.genre || 'Unknown Genre',
								image: metadata.common.picture
									? new Blob([metadata.common.picture[0].data], {
											type: metadata.common.picture[0].format
										})
									: undefined
							};

							const artist: Artist = {
								id: uuidv4(),
								name: metadata.common.artist || 'Unknown Artist'
							};

							await OPFS.addAlbum(album, track.id);
							await OPFS.addArtist(artist, track.id, track.album);
							await OPFS.addTrack(track);
							await OPFS.addFile(track.id, file, track);
						} catch (error) {
							errorText += `\n${error}`;
						}
					}
				}
				toast.success(`Library added successfully!`);
				getLength();
			};

			if (window.showDirectoryPicker && !mobileFiles) {
				// Chrome only
				const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
				const files: File[] = [];

				for await (const entry of dirHandle.values()) {
					if (entry.kind === 'file') {
						const file: File = await entry.getFile();
						files.push(file);
					}
				}

				handleFiles(files);
			} else {
				if (mobileFiles) {
					handleFiles(input.files);
				}
			}
		} catch (error) {
			errorText += `\n${error}`;
		}
	}

	let length = 0;
	async function getLength() {
		length = (await OPFS.ls('/tracks')).length - 1;
		if (length < 0) {
			length = 0;
		}
	}

	onMount(() => {
		getLength();
		findDevice();
		title.set('Settings');
	});

	let device = 'chrome';
	function findDevice() {
		if (!window.showDirectoryPicker) {
			device = 'ew';
		}
	}
	let dir = '';
	let text = '> ';
	async function send() {
		const lines = text.split('\n');
		const newText = lines[lines.length - 1].substring(dir.length + 2);
		if (newText.startsWith('ls')) {
			let selectedDir = '';
			let subdir = newText.split(' ')[1] || '';
			if (subdir.startsWith('/')) {
				subdir = subdir.substring(1);
			}
			if (!subdir.endsWith('/') && subdir !== '') {
				subdir = subdir + '/';
			}
			if (dir === '' && subdir === '') {
				selectedDir = '/';
			} else if (dir === '') {
				selectedDir = subdir;
			} else {
				selectedDir = dir + subdir;
			}

			const ls = await OPFS.ls(selectedDir);
			let names = [];
			ls.forEach((file) => {
				names.push(file.name);
			});

			if (names.length === 0) {
				text += `No files found in ${selectedDir}\n${dir}> `;
			} else {
				text += `${names.join('\n')}\n${dir}> `;
			}
		} else if (newText == 'clear') {
			await clearLibrary();
			text += 'Library cleared\n' + dir + '> ';
			getLength();
		} else if (newText == 'exit') {
			text = dir + '> ';
		} else if (newText.startsWith('help')) {
			let helpCmd = newText.split(' ')[1] || '';
			text += '\n';
			if (helpCmd == 'ls') {
				text +=
					"This command lists the files in the selected directory, or if left blank, the current directory: 'ls (directory)'\n" +
					dir +
					'> ';
			} else if (helpCmd == 'clear') {
				text += "This command clears the library. Use with caution: 'clear'\n" + dir + '> ';
			} else if (helpCmd == 'exit') {
				text += "This command clears the terminal: 'exit'\n" + dir + '> ';
			} else if (helpCmd == 'import') {
				text += "This command imports a library from your computer: 'import'\n" + dir + '> ';
			} else if (helpCmd == 'cd') {
				text +=
					"This command changes the current directory to the specified directory: 'cd [directory]'\n" +
					dir +
					'> ';
			} else if (helpCmd == 'download') {
				text +=
					"This command downloads a file from the library: 'download [filePath]'\n" + dir + '> ';
			} else if (helpCmd == 'help') {
				text +=
					"This command lists the available commands, and information about them: 'help [command]'\n" +
					dir +
					'> ';
			} else {
				text += 'Welcome to the OPFS CLI!\n';
				text +=
					"Commands: ls, clear, exit, import, cd, download, help\n For more information, type 'help [command]'\n" +
					dir +
					'> ';
			}
		} else if (newText == 'import') {
			await createLibrary();
			text += 'Library imported\n' + dir + '> ';
		} else if (newText.startsWith('cd')) {
			dir = newText.split(' ')[1];
			if (!dir.startsWith('/')) {
				dir = '/' + dir;
			}
			if (!dir.endsWith('/')) {
				dir = dir + '/';
			}
			text += '\n' + dir + '> ';
		} else if (newText.startsWith('download')) {
			let selectedDir = '';
			let subdir = newText.split(' ')[1] || '';
			if (!subdir.startsWith('/')) {
				subdir = '/' + subdir;
			}
			if (dir === '' && subdir === '') {
				selectedDir = '/';
			} else if (dir === '') {
				selectedDir = subdir;
			} else {
				selectedDir = dir + subdir;
			}

			const fileObj = await OPFS.downloadFile(selectedDir);
			const file = fileObj[1];
			const fileName = fileObj[0];
			let type = file.type;
			file.text().then((text) => {
				const blob = new Blob([text], { type });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = fileName;
				a.click();
				URL.revokeObjectURL(url);
			});
			text += 'Downloading ' + selectedDir + '...\n' + dir + '> ';
		} else {
			text += 'Command not found\n' + dir + '> ';
		}
	}
	function handleKeydown(event) {
		if (event.key === 'Backspace') {
			if (text.length <= dir.length + 2) {
				event.preventDefault();
			}
		}
		if (event.key === 'Enter') {
			if (text.length > 2) {
				send();
			} else {
				event.preventDefault();
			}
		}
	}

	function clearLibrary() {
		OPFS.clearLibrary();
		getLength();
	}

	let devMode = false;
	let showLogging = false;
</script>

<div class="mt-16 flex flex-col items-center justify-center">
	<h2>You currently have {length} tracks imported</h2>
	<div class="border-1 mt-4 items-center justify-center rounded-sm border p-10 px-20">
		{#if device == 'ew'}
			<input
				type="file"
				id="files"
				class="block w-full rounded-md border-2 border-gray-300 px-2 py-1 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring focus:ring-indigo-200"
				accept="audio/*"
				multiple
				on:change={(e) => createLibrary(e)}
			/>
		{:else}
			<Button variant="secondary" on:click={() => createLibrary()}>Import Music</Button>
		{/if}
		<Button variant="destructive" on:click={() => clearLibrary()}>Clear Library</Button>
	</div>
	<h1 class="text-muted-foreground text-center text-sm">tip: you can upload as many different folders/files as you'd like.</h1>
</div>

<div class="mt-5 flex flex-col items-center justify-center space-x-2">
	<div class="mb-2 flex flex-row items-center">
		<Switch class="mr-2" id="devMode" bind:checked={devMode} />
		<Label for="devMode">Developer Mode</Label>
	</div>
	<div class="mt-1 flex flex-row items-center">
		<Switch class="mr-2" id="logging" bind:checked={showLogging} />
		<Label for="logging">Show Logging</Label>
	</div>
</div>

{#if devMode}
	<div class="mx-10 mt-10 font-['VT323']">
		<Textarea
			on:keydown={handleKeydown}
			class="h-48"
			bind:value={text}
			placeholder="Type your message here."
		/>
	</div>
{/if}

{#if showLogging}
	<div class="mx-10 mt-10 font-['VT323']">
		<Textarea class="h-48" bind:value={errorText} placeholder="LOG" disabled />
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
</style>
