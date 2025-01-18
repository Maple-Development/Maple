<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { UserManager } from '$lib/api/UserManager';
    import { Input } from "$lib/components/ui/input/index.js";
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import { onMount } from 'svelte';
    import { UserInfo } from '$lib/store';

    let username = '';
    let password = '';
    let log = '';

    let authenticated = false;
    $: authenticated = authenticated;

    onMount(async () => {
        const authenticatedS = await UserManager.isLoggedIn();
        authenticated = authenticatedS.isAuthenticated;
    });

    async function createAccount() {
		log = JSON.stringify(await UserManager.register(username, password))
        username = '';
        password = '';
	}

	async function login() {
		log = JSON.stringify(await UserManager.login(username, password));
        username = '';
        password = '';
	}

    UserInfo.subscribe(async (value) => {
        if (value) {
            const islogOut = await UserManager.isLoggedIn();
            authenticated = islogOut.isAuthenticated;
        }
    })


</script>

{#await UserManager.isLoggedIn() then user}

{#if !authenticated}

<div class="mt-16 flex flex-col items-center justify-center">
    <Input bind:value={username} type="username" placeholder="username" class="max-w-xs my-1" />
    <Input bind:value={password} type="password" placeholder="password" class="max-w-xs my-1" />

    <div class="mt-2 flex flex-col">
        <h1 class="px-1 text-sm font-semibold text-foreground">Password Requirements:</h1>
        <div class="ml-2">
            <ul class="list-disc">
                <li class="ml-5 text-xs text-muted">At least 8 characters</li>
                <li class="ml-5 text-xs text-muted">At least 1 lowercase letter</li>
                <li class="ml-5 text-xs text-muted">At least 1 uppercase letter</li>
                <li class="ml-5 text-xs text-muted">At least 1 number</li>
                <li class="ml-5 text-xs text-muted">At least 1 special character</li>
            </ul>
        </div>
    </div>
</div>

<div class="mt-6 flex items-center justify-center">
	<Button class="py-6 px-4 mx-2" variant="secondary" on:click={createAccount}>Register User</Button> 
	<Button class="py-6 px-4 mx-2" variant="secondary" on:click={login}>Login</Button>
</div>

<div class="mt-16 flex flex-col items-center justify-center">
    <Textarea class="h-48" bind:value={log} placeholder="LOG" disabled />
</div>  

{:else}
    <div class="mt-10 flex items-center justify-center">
        <Button class="py-6 px-4 mx-2" variant="secondary" href='/account'>View Account</Button>
        <Button class="py-6 px-4 mx-2 text-white" variant="destructive" on:click={UserManager.logOut}>Log Out</Button>
    </div>
{/if}

{/await}

