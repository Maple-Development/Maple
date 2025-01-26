<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { UserManager } from '$lib/api/UserManager';
    import { Input } from "$lib/components/ui/input/index.js";
    import { isLoggedIn } from '$lib/store';

    let username = '';
    let password = '';
    let log = '';

	async function login() {
		log = JSON.stringify(await UserManager.login(username, password));
        username = '';
        password = '';
        history.back();
	}


</script>

{#if !$isLoggedIn}

<h1 class="text-5xl text-center mt-10 font-black">
    Login
</h1>

<div class="mt-16 flex flex-col items-center justify-center">
    <Input bind:value={username} type="username" placeholder="username" class="max-w-xs my-1" />
    <Input bind:value={password} type="password" placeholder="password" class="max-w-xs my-1" />
</div>

<div class="mt-6 flex items-center justify-center">
	<Button class="py-6 px-4 mx-2" variant="secondary" on:click={login}>Login</Button>
</div>

{/if}

