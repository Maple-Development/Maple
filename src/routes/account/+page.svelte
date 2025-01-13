<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { OPFS } from '$lib/opfs';
    import { Input } from "$lib/components/ui/input/index.js";
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

    let username = '';
    let password = '';
    let log = '';

    async function createAccount() {
		log = JSON.stringify(await OPFS.createAccount(username, password))
	}

	async function login() {
		log = JSON.stringify(await OPFS.login(username, password));
	}


</script>

<div class="mt-16 flex flex-col items-center justify-center">
    <Input bind:value={username} type="username" placeholder="username" class="max-w-xs my-1" />
    <Input bind:value={password} type="password" placeholder="password" class="max-w-xs my-1" />
</div>

<div class="mt-2 flex items-center justify-center">
	<Button class="py-6 px-4 mx-2" variant="secondary" on:click={createAccount}>Create Account</Button>
	<Button class="py-6 px-4 mx-2" variant="secondary" on:click={login}>Login</Button>
</div>

<div class="mt-16 flex flex-col items-center justify-center">
    <Textarea class="h-48" bind:value={log} placeholder="LOG" disabled />
</div>