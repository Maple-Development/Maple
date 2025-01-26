<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { onMount } from 'svelte';
	import { isLoggedIn } from '$lib/store';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import UserSettings from '$lib/preferences/usersettings';
	import { Settings } from '$lib/preferences/fetch';
	import { toast } from 'svelte-sonner';

	let webhookSettings = new Settings('webhook');

	let doWebhooks = true;
	let webhookUrl = '';

	onMount(async () => {
		webhookUrl = UserSettings.webhook.url;
		doWebhooks = UserSettings.webhook.enabled;
	});

	function updateSettings() {
		webhookSettings.set('enabled', doWebhooks);
		if (webhookUrl != '') {
			webhookSettings.set('url', webhookUrl);
		} else {
			webhookSettings.set('url', UserSettings.webhook.url);
		}
		toast.success('Settings updated, refreshing now.');
		window.location.reload();
	}
</script>

{#if !$isLoggedIn}
	<h1 class="mt-10 text-center text-5xl font-black">You are not logged in!</h1>

	<Button href="/account/login" class="my-1 ml-3 h-10 w-10 bg-transparent px-1 hover:bg-secondary">
		Login
	</Button>
{:else}
	<h1 class="mt-10 text-center text-5xl font-black">Preferences</h1>

	<div class="mx-[10%] mt-10 flex flex-col justify-center md:mx-[30%]">
		<h2 class="mt-5 text-4xl font-black">Webhook Options</h2>

		<div class="mt-5 flex items-center space-x-2">
			<Switch bind:checked={doWebhooks} id="webhooks" class="text-muted hover:text-black" />
			<label for="webhooks">Enable Webhooks</label>
		</div>
		<p class="text-xs text-muted">Enables sending data to a chosen webhook</p>

		<div class="mt-5 flex items-center space-x-2">
			<Input
				bind:value={webhookUrl}
				class="text-muted"
				placeholder="Ex: https://discord.com/api/webhooks/13292141241482912/HCAg7pewfwfewF_wefcQxOGN6ZAMDewfwfwfbIAawefhLz"
			/>
		</div>
		<p class="text-xs text-muted">
			Webhook URL to automatically send to. (Currently, the only supported service is Discord) [If
			left blank, the community webhook will be used.]
		</p>
	</div>

	<div class="mx-[10%] mt-5 flex flex-col justify-center md:mx-[30%]">
		<!--  <h2 class="text-4xl font-black mt-5">Manage Profile</h2>
    <p class="text-muted mt-2">Change Display Name</p>
    <Input class="text-muted" placeholder="Display name"/>

    <p class="text-muted mt-2">Change Profile Picture</p>
    <Input type="file" accept="image/*" class="text-muted"/> -->
	</div>

	<div class="mx-[10%] mb-20 mt-5 flex flex-col justify-center md:mx-[30%]">
		<!-- <h2 class="text-4xl font-black mt-5">Manage Profile</h2>
    <p class="text-muted mt-2">Change Display Name</p>
    <Input class="text-muted" placeholder="Display name"/>

    <p class="text-muted mt-2">Change Profile Picture</p>
    <Input type="file" accept="image/*" class="text-muted"/>
 -->
		<Button on:click={updateSettings} class="mx-2 mt-4 px-4 py-6 text-white" variant="secondary"
			>Submit</Button
		>
	</div>
{/if}
