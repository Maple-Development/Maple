<script lang="ts">
	import { UserManager } from '$lib/api/UserManager';
	import { Button, TextFieldOutlined } from 'm3-svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { title } from '$lib/store';

	let username = $state('');
	let password = $state('');

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		await UserManager.register(username, password);
	}

	onMount(async () => {
		title.set('Register');
	});
</script>

<div class="h-full w-full flex items-center justify-center p-4">
	<div
		class="w-full max-w-md flex flex-col gap-8 p-8 rounded-3xl mt-10 bg-surface-container-high shadow-md"
	>
		<div class="flex flex-col gap-2 text-center">
			<h1 class="text-4xl font-medium tracking-tight text-on-surface">Create an account</h1>
			<p class="text-base text-on-surface-variant">Join Maple to start listening with friends.</p>
		</div>

		<form onsubmit={onSubmit} class="flex flex-col gap-6">
			<TextFieldOutlined label="Username" bind:value={username} />
			<TextFieldOutlined label="Password" bind:value={password} type="password" />
			<div class="flex flex-col gap-3 pt-2">
				<Button variant="filled" type="submit">Sign up</Button>
			</div>
		</form>

		<div class="flex items-center gap-4">
			<div class="flex-1 h-px bg-outline-variant"></div>
			<span class="text-sm text-on-surface-variant">or</span>
			<div class="flex-1 h-px bg-outline-variant"></div>
		</div>

		<div class="flex flex-col gap-3">
			<Button variant="outlined" onclick={() => goto('/login')}>Already have an account? Sign in</Button>
		</div>
	</div>
</div>