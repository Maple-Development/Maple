<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { User } from '$lib/api/user';
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
        const authenticatedS = await User.isLoggedIn();
        authenticated = authenticatedS.isAuthenticated;
    });

    async function createAccount() {
		log = JSON.stringify(await User.register(username, password))
        username = '';
        password = '';
	}

	async function login() {
		log = JSON.stringify(await User.login(username, password));
        username = '';
        password = '';
	}

    UserInfo.subscribe(async (value) => {
        if (value) {
            const islogOut = await User.isLoggedIn();
            authenticated = islogOut.isAuthenticated;
        }
    })


</script>

{#await User.isLoggedIn() then user}

{#if !authenticated}

<div class="mt-16 flex flex-col items-center justify-center">
    <Input bind:value={username} type="username" placeholder="username" class="max-w-xs my-1" />
    <Input bind:value={password} type="password" placeholder="password" class="max-w-xs my-1" />
</div>

<div class="mt-2 flex items-center justify-center">
	<Button class="py-6 px-4 mx-2" variant="secondary" on:click={createAccount}>Register User</Button> 
	<Button class="py-6 px-4 mx-2" variant="secondary" on:click={login}>Login</Button>
</div>

<div class="mt-16 flex flex-col items-center justify-center">
    <Textarea class="h-48" bind:value={log} placeholder="LOG" disabled />
</div>  

{:else}
    <div class="mt-10 flex items-center justify-center">
        <Button class="py-6 px-4 mx-2" variant="secondary" href='/account'>View Account</Button>
        <Button class="py-6 px-4 mx-2 text-white" variant="destructive" on:click={User.logOut}>Log Out</Button>
    </div>
{/if}

{/await}

