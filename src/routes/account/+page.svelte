<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { User } from '$lib/api/user';
    import { Input } from "$lib/components/ui/input/index.js";
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import { onMount } from 'svelte';
    let userData = "";

    async function getUserData() {
        userData = await User.getUser();
    }

    onMount(() => {
        getUserData();
    });
</script>

<div class="mt-16 flex flex-col items-center justify-center">
    <Textarea bind:value={userData} class="h-48" />
</div>