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

<div class="flex h-full w-full items-center justify-center p-4">
	<div
		class="bg-surface-container-high mt-10 flex w-full max-w-md flex-col gap-8 rounded-3xl p-8 shadow-md"
	>
		<div class="flex flex-col gap-2 text-center">
			<h1 class="text-on-surface text-4xl font-medium tracking-tight">Create an account</h1>
			<p class="text-on-surface-variant text-base">Join Maple to start listening with friends.</p>
		</div>

		<form onsubmit={onSubmit} class="flex flex-col gap-6">
			<TextFieldOutlined label="Username" bind:value={username} />
			<TextFieldOutlined label="Password" bind:value={password} type="password" />
			<div class="flex flex-col gap-3 pt-2">
				<Button variant="filled" type="submit">Sign up</Button>
			</div>
		</form>

		<div class="flex items-center gap-4">
			<div class="bg-outline-variant h-px flex-1"></div>
			<span class="text-on-surface-variant text-sm">or</span>
			<div class="bg-outline-variant h-px flex-1"></div>
		</div>

		<div class="flex flex-col gap-3">
			<Button variant="outlined" onclick={() => goto('/login')}
				>Already have an account? Sign in</Button
			>
		</div>
	</div>
</div>
