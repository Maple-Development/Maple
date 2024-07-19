<script>
	// @ts-nocheck
	import '../app.pcss';
	import NowPlaying from '$lib/components/NowPlaying.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
</script>

<div class="flex h-screen flex-col">
	<div class="border-b border-gray-300">
		<TopBar />
	</div>
	<div class="mt-1/10 flex flex-1">
		<div class="w-3/5 max-h-screen overflow-y-auto scrollbar">
			<slot />
		</div>
		<div class="w-2/5 border-l border-gray-300">
			<NowPlaying />
		</div>
	</div>
</div>
