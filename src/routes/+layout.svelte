<script lang="ts">
	import '../app.css';
	import '../main.css';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { isLoggedIn, title, loadPreferencesStore } from '$lib/store';
	import { UserManager } from '$lib/api/UserManager';
	import { onMount } from 'svelte';
	import { Snackbar } from 'm3-svelte';
	import { initTheme } from '$lib/theme/theme';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let { children, data } = $props();

	onMount(async () => {
		initTheme();
		loadPreferencesStore.load();

		const hasOnboarded = localStorage.getItem('hasOnboarded');
		const currentPath = $page.url.pathname;
		const excludedPaths = ['/onboard', '/login', '/register'];
		if (!hasOnboarded && !excludedPaths.includes(currentPath)) {
			goto('/onboard');
		}

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
