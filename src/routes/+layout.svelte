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
{@render children()}
<BottomBar />