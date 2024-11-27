<script lang="ts">
	import { OPFS } from "$lib/opfs";
    import { onMount } from "svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import { title } from "$lib/store";
    let onboard = false;
    onMount(async () => {
        onboard = await OPFS.ifExists('tracks');
        console.log(onboard);
        title.set('Home');
    });
</script>

{#if !onboard}
<div class="flex flex-col justify-center items-center mt-5">
    <h1 class="text-lg font-bold">Welcome!</h1>

    <p>It seems like you are missing a library, head to <Button class="m-0 p-1" variant="link" href="/settings">Settings</Button> to add music!</p>
</div>
{:else}
<h1>Home</h1>
{/if}






























    
    <!-- Nail was here -->
