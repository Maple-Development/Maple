<script lang="ts">
	import {
		Music,
		DiscAlbum,
		ListMusic,
		SquareUser,
		Home,
		Settings,
		CirclePlus,
		Users
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { collapsed, SavedUser } from '$lib/store';
	import * as Tooltip from "$lib/components/ui/tooltip";
</script>

<div class="ml-2 h-full w-full justify-between sm:flex sm:flex-col sm:items-center md:w-full">
	<div class="w-full sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full">
		  <Tooltip.Root>
			<Tooltip.Trigger><Button
				class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
				href="/tracks"
			>
				<Music size={20} class="mr-2 text-foreground" />
				{#if $collapsed}
					<h1 class="hidden px-1 text-foreground md:block">Tracks</h1>
				{/if}
			</Button></Tooltip.Trigger>
			<Tooltip.Content side="right" sideOffset={-6}>
			  Tracks
			</Tooltip.Content>
		  </Tooltip.Root>
		
		  <Tooltip.Root>
			<Tooltip.Trigger><Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/playlists"
		>
			<ListMusic size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Playlists</h1>
			{/if}
		</Button></Tooltip.Trigger>
			<Tooltip.Content side="right" sideOffset={-6}>
			  Playlists
			</Tooltip.Content>
		  </Tooltip.Root>
		
		  <Tooltip.Root>
			<Tooltip.Trigger><Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/albums"
		>
			<DiscAlbum size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Albums</h1>
			{/if}
		</Button></Tooltip.Trigger>
			<Tooltip.Content side="right" sideOffset={-6}>
			  Albums
			</Tooltip.Content>
		  </Tooltip.Root>
		
		  <Tooltip.Root>
			<Tooltip.Trigger><Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/artists"
		>
			<SquareUser size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Artists</h1>
			{/if}
		</Button></Tooltip.Trigger>
			<Tooltip.Content side="right" sideOffset={-6}>
			  Artists
			</Tooltip.Content>
		  </Tooltip.Root>
		
	</div>
	<div class="w-full sm:flex sm:flex-col sm:items-center sm:justify-between md:w-full">
		<Tooltip.Root>
			<Tooltip.Trigger><Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/playlists?create=true"
		>
			<CirclePlus size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-xs text-foreground md:block">New Playlist</h1>
			{/if}
		</Button></Tooltip.Trigger>
			<Tooltip.Content side="right" sideOffset={-6}>
			  New Playlist
			</Tooltip.Content>
		  </Tooltip.Root>
		
		{#if $SavedUser.id}
		<Tooltip.Root>
			<Tooltip.Trigger><Button
				class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
				href="/friends"
			>
				<Users size={20} class="mr-2 text-foreground" />
				{#if $collapsed}
					<h1 class="hidden px-1 text-foreground md:block">Friends</h1>
				{/if}
			</Button></Tooltip.Trigger>
			<Tooltip.Content side="right" sideOffset={-6}>
			  Friends
			</Tooltip.Content>
		  </Tooltip.Root>
			
		{/if}
		<Tooltip.Root>
			<Tooltip.Trigger><Button
			class="my-1 mr-5 flex w-fit flex-row items-center justify-start bg-transparent pl-4 pr-2 hover:bg-secondary"
			href="/settings"
		>
			<Settings size={20} class="mr-2 text-foreground" />
			{#if $collapsed}
				<h1 class="hidden px-1 text-foreground md:block">Settings</h1>
			{/if}
		</Button></Tooltip.Trigger>
			<Tooltip.Content side="right" sideOffset={-6}>
			  Settings
			</Tooltip.Content>
		  </Tooltip.Root>
		
	</div>
</div>
