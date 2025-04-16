<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Settings } from '$lib/preferences/fetch';
	import UserSettings from '$lib/preferences/usersettings';
	import { isLoggedIn, title } from '$lib/store';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let webhookSettings = new Settings('webhook');
	let discordSettings = new Settings('discord');

	let doWebhooks = true;
	let webhookUrl = '';
	let doDiscord = true;

	onMount(async () => {
		webhookUrl = UserSettings.webhook.url;
		doWebhooks = UserSettings.webhook.enabled;
		doDiscord = UserSettings.discord.enabled;
		title.set('Preferences');
	});

	function updateSettings() {
		if (webhookUrl == '') {
			toast.error('Please enter a valid webhook URL');
			return;
		}
		webhookSettings.set('enabled', doWebhooks);
		discordSettings.set('enabled', doDiscord);
		if (webhookUrl != '') {
			webhookSettings.set('url', webhookUrl);
		} else {
			webhookSettings.set('url', UserSettings.webhook.url);
		}
		toast.success('Settings updated, refreshing now.');
		window.location.reload();
	}
</script>

<div class="max-w-4xl px-12 py-8">
	{#if !$isLoggedIn}
		<div class="text-center">
			<h1 class="mb-4 text-2xl font-semibold">You are not logged in!</h1>
			<Button href="/account/login" variant="secondary">
				Login
			</Button>
		</div>
	{:else}
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-2xl font-semibold">Preferences</h1>
			<p class="text-muted-foreground">Manage your account and notification settings</p>
		</div>

		<div class="mb-8 rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-4 text-center text-lg font-medium">Webhook Settings</h2>
			
			<div class="space-y-6">
				<div class="flex items-center justify-between rounded-lg bg-background p-2">
					<div class="space-y-0.5">
						<Label for="webhooks" class="text-base">Enable Webhooks</Label>
						<p class="text-sm text-muted-foreground">Send data to a chosen webhook service</p>
					</div>
					<Switch id="webhooks" bind:checked={doWebhooks} />
				</div>

				<div class="space-y-2">
					<Label for="webhookUrl">Webhook URL</Label>
					<Input
						id="webhookUrl"
						bind:value={webhookUrl}
						placeholder="https://discord.com/api/webhooks/..."
						class="w-full"
					/>
					<p class="text-sm text-muted-foreground">
						Webhook URL to automatically send to. Currently supports Discord webhooks. If left blank, the community webhook will be used.
					</p>
				</div>
			</div>
		</div>

		<div class="mb-8 rounded-lg border bg-card p-6 shadow-sm">
			<h2 class="mb-4 text-center text-lg font-medium">Discord Settings</h2>
			
			<div class="space-y-6">
				<div class="flex items-center justify-between rounded-lg bg-background p-2">
					<div class="space-y-0.5">
						<Label for="discord" class="text-base">Enable Discord RPC</Label>
						<p class="text-sm text-muted-foreground">Show what you're listening to in Discord</p>
					</div>
					<Switch id="discord" bind:checked={doDiscord} />
				</div>
			</div>
		</div>

		<div class="mt-6 flex justify-center">
			<Button on:click={updateSettings} variant="secondary">
				Save Preferences
			</Button>
		</div>
	{/if}
</div>
