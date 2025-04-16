<script lang="ts">
	import { UserManager } from '$lib/api/UserManager';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { SavedUser, title } from '$lib/store';
	import type { User } from '$lib/types/user';
	import { User as UserIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';

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

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="text-4xl font-bold tracking-tight">Account Settings</h1>
		<p class="mt-2 text-muted-foreground">Manage your account information and preferences</p>
	</div>

	<div class="grid gap-8 md:grid-cols-2">
		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<div class="flex flex-col items-center space-y-4">
				<div class="relative">
					{#if userData.pfp}
						<div class="group relative">
							<img
								src={userData.pfp}
								alt="Profile"
								class="h-32 w-32 rounded-full object-cover shadow-md transition-all duration-300 group-hover:opacity-75"
							/>
							<div class="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
								<label
									for="profile-image"
									class="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
								>
									Change Image
								</label>
								<input
									id="profile-image"
									type="file"
									class="hidden"
									accept="image/*"
									on:change={(e) => handleFileChange(e)}
								/>
							</div>
						</div>
					{:else}
						<div class="group relative">
							<div class="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
								<UserIcon class="h-16 w-16 text-primary" />
							</div>
							<div class="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
								<label
									for="profile-image"
									class="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
								>
									Add Image
								</label>
								<input
									id="profile-image"
									type="file"
									class="hidden"
									accept="image/*"
									on:change={(e) => handleFileChange(e)}
								/>
							</div>
						</div>
					{/if}
				</div>
				<div class="text-center">
					<h2 class="text-xl font-semibold">{userData.username}</h2>
					{#if userData.name}
						<p class="text-muted-foreground">{userData.name}</p>
					{/if}
					<p class="mt-1 text-sm text-muted-foreground">ID: {userData.id}</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-6 text-xl font-semibold">Update Profile</h2>
			<div class="space-y-4">
				<div>
					<h1 class="mb-2 block text-sm font-medium">Display Name</h1>
					<Input
						bind:value={displayName}
						placeholder="Enter your display name"
						class="w-full"
					/>
				</div>
				<Button
					class="w-full"
					variant="default"
					on:click={updateUser}
				>
					Save Changes
				</Button>
			</div>
		</div>
	</div>
</div>
