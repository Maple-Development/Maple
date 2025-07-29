<script lang="ts">
	import '../app.css';
	import '../main.css';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';

	let { children } = $props();
</script>

<TopBar />
<SideBar />
<div class="fixed inset-0 left-23 top-14 bottom-30 overflow-y-auto overflow-x-hidden">
	<div>
		{@render children()}
	</div>
</div>
<BottomBar />