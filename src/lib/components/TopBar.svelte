<script type="ts">
	import {
		Music,
		PanelRightOpen,
		DiscAlbum,
		ListMusic,
		SquareUser,
		Search
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { collapsed } from '$lib/store';
	let open = false;
</script>

<div class="flex justify-between">
	<div class="flex">
		<Button class="my-1 ml-2 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => ($collapsed = !$collapsed)}
			><PanelRightOpen size={20} color="white" /></Button
		>
	</div>
	<div class="flex flex-grow justify-center">
		<Button
			on:click={() => (open = !open)}
			class="my-2 h-8 max-w-xs text-primary"
			variant="outline"
		>
			<Search size={20} color="white" />
			<span class="ml-2">Search</span>
		</Button>
	</div>
</div>

<Command.Dialog class="bg-background" bind:open>
	<Command.Input placeholder="Search for recent items, or type a page name." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Recent items">
			<Command.Item>
				<SquareUser class="mr-2 h-4 w-4" />
				<span>Nirvana</span>
			</Command.Item>
			<Command.Item>
				<SquareUser class="mr-2 h-4 w-4" />
				<span>Kendrick Lamar</span>
			</Command.Item>
			<Command.Item>
				<DiscAlbum class="mr-2 h-4 w-4" />
				<span>Damn.</span>
			</Command.Item>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Go to">
			<Command.Item>
				<Music class="mr-2 h-4 w-4" />
				<span>Library</span>
			</Command.Item>
			<Command.Item>
				<SquareUser class="mr-2 h-4 w-4" />
				<span>Artists</span>
			</Command.Item>
			<Command.Item>
				<DiscAlbum class="mr-2 h-4 w-4" />
				<span>Albums</span>
			</Command.Item>
			<Command.Item>
				<ListMusic class="mr-2 h-4 w-4" />
				<span>Playlists</span>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
