<script lang="ts">
	import '../app.css';
	import '../main.css';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { isLoggedIn, title } from '$lib/store';
	import { UserManager } from '$lib/api/UserManager';
	import { onMount } from 'svelte';
	import { Snackbar } from 'm3-svelte';

	let { children, data } = $props();

	onMount(async () => {
		const user = await UserManager.checkSession();
		if (user) {
			isLoggedIn.set(true);
		} else {
			isLoggedIn.set(false);
		}
	});
</script>

<svelte:head>
	<title>{$title}</title>
</svelte:head>

<SideBar />
<div class="fixed inset-0 bottom-30 left-23 overflow-x-hidden overflow-y-auto">
	<div>
		{@render children()}
	</div>
</div>
<BottomBar />
<Snackbar />
