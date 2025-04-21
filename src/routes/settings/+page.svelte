<script lang="ts">
	//@ts-nocheck
	import Button from '$lib/components/ui/button/button.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { OPFS } from '$lib/opfs';
	import { Settings } from '$lib/preferences/fetch';
	import UserSettings from '$lib/preferences/usersettings';
	import { title } from '$lib/store';
	import { createLibrary } from '$lib/library';
	import { Users } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let preferences = new Settings('preferences');

	let errorText = 'LOG will appear here';
	let devMode = false;
	let showLogging = false;
	let p2p = true;
	let socket = true;
	let jellyfinMode = false;

	let deferredPrompt;

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
		p2p = UserSettings.preferences.p2p;
		devMode = UserSettings.preferences.devMode;
		showLogging = UserSettings.preferences.showLogging;
		socket = UserSettings.preferences.socket;
		jellyfinMode = UserSettings.preferences.jellyfinMode;
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
		localStorage.clear();
		getLength();
	}

	function updatePrefs() {
		preferences.set('p2p', p2p);
		preferences.set('devMode', devMode);
		preferences.set('showLogging', showLogging);
		preferences.set('socket', socket);
		preferences.set('jellyfinMode', jellyfinMode);
		toast.success('Settings updated',
			{
				action: {
					label: 'Refresh now?',
					onClick: () => {
						window.location.reload();
					}
				},
			}
		);
	}
</script>

<div class=" mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-2xl font-semibold">Settings</h1>
		<p class="text-muted-foreground">Manage your library and application preferences</p>
	</div>

	<div class="mb-8 rounded-lg border bg-card p-6 shadow-sm">
		<div class="mb-6 text-center">
			<h2 class="mb-1 text-lg font-medium">Library Management</h2>
			<p class="text-sm text-muted-foreground">You currently have {length} tracks imported</p>
		</div>

		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			{#if device == 'ew'}
				<div class="w-full max-w-md">
					<input
						type="file"
						id="files"
						class="block w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						accept="audio/*"
						multiple
						on:change={(e) => createLibrary(e)}
					/>
				</div>
			{:else}
				<Button
					class="w-full sm:w-auto"
					variant="secondary"
					on:click={() => createLibrary()}
				>
					<Users class="mr-2 h-4 w-4" />
					Import Music
				</Button>
			{/if}
			<Button
				class="w-full sm:w-auto"
				variant="destructive"
				on:click={() => clearLibrary()}
			>
				Clear Library
			</Button>
		</div>
	</div>

	<div class="mb-8 rounded-lg border bg-card p-6 shadow-sm">
		<h2 class="mb-4 text-center text-lg font-medium">Developer Options</h2>
		<div class="space-y-4">
			<div class="flex items-center justify-between rounded-lg bg-background p-2">
				<div class="space-y-0.5">
					<Label for="devMode" class="text-base">Developer Mode</Label>
					<p class="text-sm text-muted-foreground">Enable developer tools and features</p>
				</div>
				<Switch id="devMode" bind:checked={devMode} />
			</div>

			<div class="flex items-center justify-between rounded-lg bg-background p-2">
				<div class="space-y-0.5">
					<Label for="logging" class="text-base">Show Logging</Label>
					<p class="text-sm text-muted-foreground">Display debug logs and system information</p>
				</div>
				<Switch id="logging" bind:checked={showLogging} />
			</div>

			<Separator class="my-4" />

			<div class="flex items-center justify-between rounded-lg bg-background p-2">
				<div class="space-y-0.5">
					<Label for="p2p" class="text-base">P2P Transfer</Label>
					<p class="text-sm text-muted-foreground">Enable peer-to-peer file sharing</p>
				</div>
				<Switch id="p2p" bind:checked={p2p} />
			</div>

			<div class="flex items-center justify-between rounded-lg bg-background p-2">
				<div class="space-y-0.5">
					<Label for="socket" class="text-base">Socket.io Communication</Label>
					<p class="text-sm text-muted-foreground">Enable real-time communication features</p>
				</div>
				<Switch id="socket" bind:checked={socket} />
			</div>

			<div class="flex items-center justify-between rounded-lg bg-background p-2">
				<div class="space-y-0.5">
					<Label for="jellyfinMode" class="text-base">Jellyfin Library Mode</Label>
					<p class="text-sm text-muted-foreground">Use Jellyfin-style folder structure for importing music</p>
				</div>
				<Switch id="jellyfinMode" bind:checked={jellyfinMode} />
			</div>
		</div>

		<div class="mt-6 flex justify-center">
			<Button
				on:click={updatePrefs}
				class="w-full sm:w-auto"
				variant="secondary"
			>
				Save Settings
			</Button>
		</div>
	</div>

	<p class="text-center text-sm text-muted-foreground">
		Tip: You can upload as many different folders/files as you'd like.
	</p>
</div>

{#if UserSettings.preferences.devMode}
	<div class=" mx-auto max-w-4xl px-4">
		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-4 text-center text-lg font-medium">Developer Console</h2>
			<Textarea
				on:keydown={handleKeydown}
				class="h-48 w-full rounded-md border bg-background p-3 font-mono text-sm"
				bind:value={text}
				placeholder="Type your message here..."
			/>
		</div>
	</div>
{/if}

{#if UserSettings.preferences.showLogging}
	<div class="px-12 max-w-4xl py-8">
		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-4 text-center text-lg font-medium">System Logs</h2>
			<Textarea
				class="h-48 w-full rounded-md border bg-background p-3 font-mono text-sm"
				bind:value={errorText}
				placeholder="Logs will appear here..."
				disabled
			/>
		</div>
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
</style>
