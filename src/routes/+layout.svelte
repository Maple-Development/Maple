<script lang="ts">
	import '../app.css';
	import '../main.css';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
    import { isLoggedIn } from '$lib/store';
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

<SideBar />
<div class="fixed inset-0 left-23 bottom-30 overflow-y-auto overflow-x-hidden">
	<div>
		{@render children()}
	</div>
</div>
<BottomBar />
<Snackbar />