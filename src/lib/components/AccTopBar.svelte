<script lang="ts">
import {
    ArrowLeft
} from 'lucide-svelte';
import { onMount } from 'svelte';
import { User } from '$lib/api/user';
import { UserInfo } from '$lib/store';

let logOut = false;

onMount(async () => {
    const islogOut = await User.isLoggedIn();
    logOut = islogOut.isAuthenticated;
    console.log(logOut);
    console.log(islogOut);
})

UserInfo.subscribe(async (value) => {
    if (value) {
        const islogOut = await User.isLoggedIn();
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
            <Button variant="link" class="my-1 h-10 mr-4" on:click={User.logOut}>Log Out</Button>
        {/if}
    </div>
</div>