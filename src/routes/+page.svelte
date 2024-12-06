<script lang="ts">
	import { OPFS } from '$lib/opfs';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { title } from '$lib/store';
	import ContextMenu from '$lib/components/ui/context-menu/context-menu.svelte';
	import { ArrowDownZA, ArrowUpAZ, List, ListFilter } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	let onboard = false;
	onMount(async () => {
		onboard = await OPFS.ifExists('tracks');
		console.log(onboard);
		title.set('Home');
	});
	import * as Command from "$lib/components/ui/command";

	let ascending = true;

	function swapAscending() {
		ascending = !ascending;
	}
</script>

	<div class="mt-5 flex flex-col items-center">
		<h1 class="text-lg font-bold">Welcome to Maple!</h1>

		<div class="mt-5 flex flex-col items-center justify-center bg-secondary p-5 rounded-md">
			<p class="text-sm text-secondary-foreground text-center text-md font-medium">
				Welcome to maple! This site allows you to upload your music library, and explore and organize your music. <br>
				You can upload your music by going to settings or using the developer terminal.
			</p>
		</div>
		{#if !onboard}
		<div class="mt-5 flex flex-col items-center justify-center bg-destructive p-5 rounded-md">
			<p class="text-sm text-destructive-foreground">
				It seems like you are missing a library, head to <Button
					class="m-0 p-1"
					variant="link"
					href="/settings">Settings</Button
				> to add music!
			</p>
		</div>
		{:else}
		<div class="mt-5 flex flex-col items-center justify-center bg-primary p-5 rounded-md">
			<p class="text-sm text-primary-foreground">
				You're all set! Head to <Button
					class="m-0 p-1 text-primary-foreground"
					variant="link"
					href="/tracks">/tracks</Button
				> to get started!
			</p>
		</div>
		{/if}

		<div class="mt-5 flex flex-col bg-secondary p-5 rounded-md">
			<h2 class="text-sm text-secondary-foreground text-left text-md font-medium">#1: Context Menus:</h2>
			<p class="text-sm text-muted-foreground text-left text-md font-medium">
				tip: right click on a song to open a context menu!<br>
				(try it below!)
			</p>
			<div class="flex flex-col items-center justify-center">
				<ContextMenu type={'track'}>
					<div class="h-52 w-52 animate-pulse rounded-md bg-gray-500 mt-2"></div>
				</ContextMenu>
			</div>
		</div>
		<div class="mt-5 flex flex-col bg-background p-5 rounded-md w-96">
			<h2 class="text-sm text-secondary-foreground text-left text-md font-medium">#2: Filters:</h2>
			<p class="text-sm text-muted-foreground text-left text-md font-medium">
				Filters allow you to organize the different sections of your library by various attributes. <br>
				(try it below!)
			</p>
			<div class="flex flex-col items-center justify-center">
				<div class="mt-4 flex h-10 w-full justify-center">
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
							<DropdownMenu.RadioGroup>
								<DropdownMenu.RadioItem value="title"
									>Title</DropdownMenu.RadioItem
								>
								<DropdownMenu.RadioItem value="artist"
									>Artist</DropdownMenu.RadioItem
								>
								<DropdownMenu.RadioItem value="album"
									>Album</DropdownMenu.RadioItem
								>
								<DropdownMenu.RadioItem value="year"
									>Year</DropdownMenu.RadioItem
								>
								<DropdownMenu.RadioItem value="duration"
									>Duration</DropdownMenu.RadioItem
								>
							</DropdownMenu.RadioGroup>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<Button
						class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary"
					>
						<List size={20} color="white" />
					</Button>
				</div>
				
			</div>
		</div>
		<div class="mt-5 flex flex-col bg-secondary p-5 rounded-md mb-5">
			<h2 class="text-sm text-secondary-foreground text-left text-md font-medium">#3: Search:</h2>
			<p class="text-sm text-muted-foreground text-left text-md font-medium">
				The search box is always avalible at the top of the screen to easily swap <br>pages, or search the content on your current page! <br>
				(try it below!)
			</p>
			<div class="flex flex-col items-center justify-center">
				<Command.Root class="w-96 mt-4">
					<Command.Input placeholder="Search for recent items, or type a page name." />
					<Command.List>
					  <Command.Empty>No results found.</Command.Empty>
					  <Command.Group heading="Pages">
						<Command.Item>Home</Command.Item>
						<Command.Item>Tracks</Command.Item>
						<Command.Item>Albums</Command.Item>
						<Command.Item>Playlists</Command.Item>
						<Command.Item>Artists</Command.Item>
						<Command.Item>Settings</Command.Item>
					  </Command.Group>
					  <Command.Separator />
					  <Command.Group heading="Tracks">
						<Command.Item>bad guy</Command.Item>
						<Command.Item>i want it that way</Command.Item>
						<Command.Item>no tears left to cry</Command.Item>
					  </Command.Group>
					</Command.List>
				  </Command.Root>
			</div>
		</div>
	</div>

