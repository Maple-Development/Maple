<script>
	// @ts-nocheck
	import '../app.pcss';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { collapsed } from '$lib/store';
	import { Toaster } from "$lib/components/ui/sonner";
	import { title } from '$lib/store';

</script>
<svelte:head>
	<title>{$title}</title>
</svelte:head>
<Toaster position="top-right" />

<div class="h-screen flex flex-col">
	<div class="sticky top-0 z-10 border-b bg-background">
		<TopBar />
	</div>
	<div class="flex-1 flex overflow-hidden">
		{#if $collapsed}
			<div class="flex-none w-16 md:w-36 sm:w-36 transition-all duration-500 border-r border-1">
				<SideBar />
			</div>
		{:else}
			<div class="flex-none w-16 md:w-16 sm:w-16 transition-all duration-500 border-r border-1">
				<SideBar />
			</div>
		{/if}
		<div class="flex-1 overflow-auto scrollbar">
			<slot />
		</div>
	</div>
	<div class="sticky bottom-0 z-10 border-t bg-background">
		<BottomBar />
	</div>
</div>

