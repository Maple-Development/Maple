<script>
	// @ts-nocheck
	import '../app.pcss';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import { collapsed } from '$lib/store';

</script>

<div class="flex h-screen flex-col">
	<div class="border-1 border">
		<TopBar />
	</div>
	<div class="mt-1/10 flex flex-1">
		{#if $collapsed}
		<div class="md:w-36 sm:w-12 w-12 max-h-screen overflow-y-auto scrollbar">
			<SideBar />
		</div>
		{:else}
		<div class="md:w-12 sm:w-12 w-12 max-h-screen overflow-y-auto scrollbar">
			<SideBar />
		</div>
		{/if}
		<div class="border-1 border">
			<slot />
		</div>
	</div>
</div>

