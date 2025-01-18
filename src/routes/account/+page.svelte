<script lang="ts">
    import type { User } from '$lib/types/user';
    import { UserManager } from '$lib/api/UserManager';
    import { User as UserIcon } from 'lucide-svelte';
    import Input from '$lib/components/ui/input/input.svelte';
    import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';

    let userData: User = {
        username: '',
        id: '',
    };

    let username = '';
    let displayName = '';
    let pfpBlob: Blob | null = null;

    async function getUserData() {
        userData = await UserManager.getUser();
    }

    

    onMount(() => {
        getUserData();
    });

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            pfpBlob = input.files[0]; 
        }
    }

    async function updateUser() {
        if (!pfpBlob) {
            console.error("No profile picture provided.");
            return;
        }

        const user = {
            id: userData.id,
            username: userData.username,
            name: displayName,
            pfp: pfpBlob
        }
        try {
            await UserManager.updateUser(user);
            console.log('User updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }
</script>

<h2 class="text-4xl font-black mt-5 text-center">Account</h2>
<div class="flex flex-row mt-5 items-start justify-center space-x-40">
    <div class="flex flex-col items-center justify-center mt-10">
        {#if userData.pfp}
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src={userData.pfp} alt="Profile Picture" class="h-64 self-center rounded-[50%] p-2" />
        {:else}
            <UserIcon color="black" class="h-64 w-fit self-center rounded-[50%] p-2 bg-primary" />
        {/if}
        <div class="mt-2 flex flex-col items-center justify-center">
            <p>Username: {userData.username}</p> 
            {#if userData.name}
            <p>Display Name: {userData.name}</p>
            {/if}
            <p>ID: {userData.id}</p>
        </div>
    </div>
    <div class="flex flex-col justify-center mt-10">
        <h2 class="text-4xl font-black mt-5">Manage Profile</h2>
        <p class="text-muted mt-2">Change Display Name</p>
        <Input class="text-muted" bind:value={displayName} placeholder="Display name"/>

        <p class="text-muted mt-2">Change Profile Picture</p>
        <Input type="file" on:change={(e) => handleFileChange(e)} accept="image/*" class="text-muted"/>

        <Button class="py-6 px-4 mx-2 text-white mt-4" variant="secondary" on:click={updateUser}>Submit</Button>
    </div>
</div>