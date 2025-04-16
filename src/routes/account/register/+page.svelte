<script lang="ts">
	import { goto } from '$app/navigation';
	import { UserManager } from '$lib/api/UserManager';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { isLoggedIn, title } from '$lib/store';

	let username = '';
	let password = '';
	let log = '';

	async function createAccount() {
		log = JSON.stringify(await UserManager.register(username, password));
		username = '';
		password = '';
		goto('/account/login');

		title.set('Create Account');
	}
</script>

{#if !$isLoggedIn}
	<h1 class="mt-10 text-center text-5xl font-black">Create Account</h1>

	<div class="mt-16 flex flex-col items-center justify-center">
		<Input bind:value={username} type="username" placeholder="username" class="my-1 max-w-xs" />
		<Input bind:value={password} type="password" placeholder="password" class="my-1 max-w-xs" />

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
		<Button class="mx-2 px-4 py-6" variant="secondary" on:click={createAccount}
			>Create Account</Button
		>
	</div>
{/if}
