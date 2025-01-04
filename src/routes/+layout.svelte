<script lang="ts">
	// @ts-nocheck
	import '../app.pcss';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { collapsed } from '$lib/store';
	import { Toaster } from '$lib/components/ui/sonner';
	import { title, isSmallDevice } from '$lib/store';
	import MobileNavBar from '$lib/components/MobileNavBar.svelte';

	let bottomDiv: HTMLDivElement;

	let isExpanded = false;

	function expand() {
		if (bottomDiv.style.height === '100%') {
			bottomDiv.style.height = 'auto';
			isExpanded = false;
		} else {
			bottomDiv.style.height = '100%';
			isExpanded = true;
		}
	}
	let smallDevice = false;
	const attachListener = () => {
		const mediaQuery = window.matchMedia('(max-width: 640px)');
		smallDevice = mediaQuery.matches;
		isSmallDevice.set(smallDevice);

		mediaQuery.addEventListener('change', (event) => {
			smallDevice = event.matches;
			isSmallDevice.set(smallDevice);
		});
	};
</script>

<svelte:window use:attachListener />
<svelte:head>
	<title>{$title}</title>
</svelte:head>
<Toaster position="top-right" /> 

<div class="flex h-screen flex-col overflow-hidden">
	{#if !smallDevice}
		<div class="sticky top-0 z-10 border-b bg-background">
			<TopBar />
		</div>
	{/if}
	<div class="flex flex-1 overflow-hidden">
		{#if !smallDevice}
		{#if $collapsed}
			<div class="border-1 w-16 flex-none border-r transition-all duration-500 sm:w-36 md:w-36">
				<SideBar />
			</div>
		{:else}
			<div class="border-1 w-16 flex-none border-r transition-all duration-500 sm:w-16 md:w-16">
				<SideBar />
			</div>
		{/if}
		{/if}
		{#if !smallDevice}
		<div class="scrollbar flex-1 overflow-auto">
			<slot />
		</div>
		{:else}
		<div class="scrollbar flex-1 overflow-auto mb-36">
			<slot />
		</div>
		{/if}
	</div>
	{#if !smallDevice}
	<div bind:this={bottomDiv} class="sticky bottom-0 transition  z-10 border-t bg-background">
		<BottomBar on:expand={expand} />
	</div>
	{:else}
	<div class="fixed inset-x-0 bottom-0 z-10 bg-background border-t" bind:this={bottomDiv}>
		<div class="mb-16">
			<BottomBar on:expand={expand} />
		</div>
		{#if !isExpanded}
		<div class="absolute inset-x-0 bottom-0 bg-background pb-safe">
			<MobileNavBar />
		</div>
		{/if}
	</div>
{/if}
</div>