<script lang="ts">
import {
    ArrowLeft,
	User
} from 'lucide-svelte';
import { onMount } from 'svelte';
import { UserManager } from '$lib/api/UserManager';
import { UserInfo, SavedUser } from '$lib/store';

let logOut = false;

onMount(async () => {
    const islogOut = await UserManager.isLoggedIn();
    logOut = islogOut.isAuthenticated;
    console.log(logOut);
    console.log(islogOut);
})

UserInfo.subscribe(async (value) => {
    if (value) {
        const islogOut = await UserManager.isLoggedIn();
        logOut = islogOut.isAuthenticated;
    }
})

import Button from './ui/button/button.svelte';

</script>

<div class="flex items-center justify-between">
    <div class="flex items-center">
        <Button class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary" on:click={() => history.back()}>
            <ArrowLeft size={20} color="white" />
        </Button>
        <h1 class="ml-2 text-lg font-bold text-muted-foreground">Back</h1>
    </div>
    <div class="flex items-center">
        {#if logOut === true}
            <Button variant="link" class="my-1 h-10" on:click={UserManager.logOut}>Log Out</Button>
        {/if}
        {#if $SavedUser && $SavedUser.pfp !== null && $SavedUser.pfp !== undefined}
            <img src={$SavedUser.pfp} alt="pfp" class="h-10 w-10 p-1 rounded-full mr-4" />
        {:else}
            <User color="black" class="h-8 w-8 self-center rounded-[50%] p-2 bg-primary mr-2" />
        {/if}
    </div>
</div>