<script lang="ts">
	import '../app.css';
	import '../main.css';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { Toaster } from 'svelte-sonner';
    import { isLoggedIn } from '$lib/store';
	import { UserManager } from '$lib/api/UserManager';
	import { onMount } from 'svelte';

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

<TopBar />
<SideBar />
<div class="fixed inset-0 left-23 top-14 bottom-30 overflow-y-auto overflow-x-hidden">
	<div>
		{@render children()}
	</div>
</div>
<BottomBar />
<Toaster />