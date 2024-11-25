<script>
	// @ts-nocheck
	import '../app.pcss';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { collapsed } from '$lib/store';

</script>

<div class="flex h-screen flex-col">
	<div class="border-1 border sticky">
		<TopBar />
	</div>
	<div class="mt-1/10 flex flex-1">
		{#if $collapsed}
		<div class="md:w-36 sm:w-16 w-16 max-h-screen sticky border border-1">
			<SideBar />
		</div>
		{:else}
		<div class="md:w-16 sm:w-16 w-16 max-h-screen sticky border border-1">
			<SideBar />
		</div>
		{/if}
		<div class="overflow-auto w-full h-full scrollbar">
			<slot />
		</div>
	</div>
	<div class="border-1 border h-20">
		<BottomBar />
	</div>
</div>

