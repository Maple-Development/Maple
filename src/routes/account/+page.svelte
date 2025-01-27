<script lang="ts">
	import type { User } from '$lib/types/user';
	import { UserManager } from '$lib/api/UserManager';
	import { User as UserIcon } from 'lucide-svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { SavedUser, title } from '$lib/store';

	let userData: User = {
		username: '',
		id: ''
	};

	let username = '';
	let displayName = '';
	let pfpBlob: Blob | null = null;

	async function getUserData() {
		userData = await UserManager.getUser();
	}

	onMount(() => {
		getUserData();

		title.set('View Account');
	});

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			pfpBlob = input.files[0];
		}
	}

	async function updateUser() {
		if (!pfpBlob) {
			console.error('No profile picture provided.');
			return;
		}

		const user = {
			id: userData.id,
			username: userData.username,
			name: displayName,
			pfp: pfpBlob
		};
		try {
			const updatedUser = await UserManager.updateUser(user);
			SavedUser.set(updatedUser as User);
		} catch (error) {
			console.error('Error updating user:', error);
		}
	}
</script>

<h2 class="mt-5 text-center text-4xl font-black">Account</h2>
<div class="flex flex-col items-center justify-center sm:flex-row sm:space-x-40">
	<div class="mt-10 flex flex-col items-center justify-center sm:mt-0">
		{#if userData.pfp}
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src={userData.pfp} alt="Profile Picture" class="h-64 self-center rounded-[50%] p-2" />
		{:else}
			<UserIcon color="black" class="h-64 w-fit self-center rounded-[50%] bg-primary p-2" />
		{/if}
		<div class="mt-2 flex flex-col items-center justify-center">
			<p class="text-center">Username: {userData.username}</p>
			{#if userData.name}
				<p class="text-center">Display Name: {userData.name}</p>
			{/if}
			<p class="text-center">ID: {userData.id}</p>
		</div>
	</div>
	<div class="mb-6 mt-10 flex flex-col justify-center sm:mt-0">
		<h2 class="mt-5 text-center text-4xl font-black">Manage Profile</h2>
		<p class="mt-2 text-center text-muted">Change Display Name</p>
		<Input class="w-full text-muted" bind:value={displayName} placeholder="Display name" />

		<p class="mt-2 text-center text-muted">Change Profile Picture</p>
		<Input
			type="file"
			on:change={(e) => handleFileChange(e)}
			accept="image/*"
			class="w-full text-muted"
		/>

		<Button class="mx-2 mt-4 w-full px-4 py-6 text-white" variant="secondary" on:click={updateUser}
			>Submit</Button
		>
	</div>
</div>
