<script lang="ts">
	// @ts-nocheck
	import '../app.pcss';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { collapsed } from '$lib/store';
	import { Toaster } from '$lib/components/ui/sonner';
	import { title } from '$lib/store';

	let bottomDiv: HTMLDivElement;

	function expand() {
		if (bottomDiv.style.height === '100%') {
			bottomDiv.style.height = 'auto';
		} else {
			bottomDiv.style.height = '100%';
		}
	}
</script>

<svelte:head>
	<title>{$title}</title>
</svelte:head>
<Toaster position="top-right" /> 

<div class="flex h-screen flex-col">
	<div class="sticky top-0 z-10 border-b bg-background">
		<TopBar />
	</div>
	<div class="flex flex-1 overflow-hidden">
		{#if $collapsed}
			<div class="border-1 w-16 flex-none border-r transition-all duration-500 sm:w-36 md:w-36">
				<SideBar />
			</div>
		{:else}
			<div class="border-1 w-16 flex-none border-r transition-all duration-500 sm:w-16 md:w-16">
				<SideBar />
			</div>
		{/if}
		<div class="scrollbar flex-1 overflow-auto">
			<slot />
		</div>
	</div>
	<div bind:this={bottomDiv} class="sticky bottom-0 transition  z-10 border-t bg-background">
		<BottomBar on:expand={expand} />
	</div>
</div>