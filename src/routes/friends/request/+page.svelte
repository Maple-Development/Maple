<script lang="ts">
    import { onMount } from "svelte";

    let username = '';
    onMount(async () => {
        let params = new URLSearchParams(document.location.search);
        username = params.get('username') ?? '';
    })
</script>

{#if username == ''}
    <div class="w-full h-full flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">No friend request found for this user!</h1>
    </div>
{:else}
<div class="w-full h-full flex flex-col items-center justify-center">
    <h1 class="text-4xl font-bold">Request from {username}!</h1>
</div>
{/if}