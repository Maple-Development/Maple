<script lang="ts">
	// @ts-nocheck
	import '../app.pcss';
	import SideBar from '$lib/components/SideBar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomBar from '$lib/components/BottomBar.svelte';
	import { collapsed, loadPreferencesStore, UserInfo } from '$lib/store';
	import { UserManager } from '$lib/api/UserManager';
	import { Toaster } from '$lib/components/ui/sonner';
	import { title, isSmallDevice, socket, isLoggedIn } from '$lib/store';
	import MobileNavBar from '$lib/components/MobileNavBar.svelte';
	import MobileTopBar from '$lib/components/MobileTopBar.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AccTopBar from '$lib/components/AccTopBar.svelte';
	import { io } from 'socket.io-client';
	import { browser } from '$app/environment';
	import { socketManager } from '../lib/socketManager.ts';
	import UserSettings from '$lib/preferences/usersettings';

	async function getUserData() {
		await UserManager.getUser();
	}

	onMount(async () => {
		loadPreferencesStore.load();
		if ($UserInfo.id) {
			await getUserData();
		}
		const authStatus = await UserManager.isLoggedIn();
		if (authStatus !== undefined) {
			isLoggedIn.set(authStatus.isAuthenticated);
		}
		if (browser) {
			if ($isLoggedIn) {
				if (UserSettings.preferences.socket) {
					const io2 = io('https://maple.kolf.pro:443', {
						withCredentials: true
					});
					socket.set(io2);
					$socket?.on('connect', () => {
						console.log('Connected to server');
					});
					socketManager();
				}
			}
		}
	});

	let bottomDiv: HTMLDivElement;

	let isExpanded = false;

	function expand() {
		if (bottomDiv.style.height === '100%') {
			bottomDiv.style.height = 'auto';
			isExpanded = false;
		} else {
			bottomDiv.style.height = '100%';
			isExpanded = true;
		}
	}
	let smallDevice = false;
	const attachListener = () => {
		const mediaQuery = window.matchMedia('(max-width: 640px)');
		smallDevice = mediaQuery.matches;
		isSmallDevice.set(smallDevice);

		mediaQuery.addEventListener('change', (event) => {
			smallDevice = event.matches;
			isSmallDevice.set(smallDevice);
		});
	};
</script>

<svelte:window use:attachListener />
<svelte:head>
	<title>{$title}</title>
</svelte:head>
<Toaster position="top-right" />

<div class="flex h-screen flex-col overflow-hidden">
	{#if $page.url.pathname !== '/account/login' && $page.url.pathname !== '/account' && $page.url.pathname !== '/account/register' && $page.url.pathname !== '/account/preferences'}
		{#if !smallDevice}
			<div class="sticky top-0 z-10 border-b bg-background">
				<TopBar />
			</div>
		{:else}
			<div class="fixed inset-x-0 top-0 z-10 border-b bg-background">
				<MobileTopBar />
			</div>
		{/if}
		<div class="flex flex-1 overflow-hidden">
			{#if !smallDevice}
				{#if $collapsed}
					<div class="border-1 w-16 flex-none border-r transition-all duration-500 sm:w-36 md:w-36">
						<SideBar />
					</div>
				{:else}
					<div class="border-1 w-16 flex-none border-r transition-all duration-500 sm:w-16 md:w-16">
						<SideBar />
					</div>
				{/if}
			{/if}
			{#if !smallDevice}
				<div class="scrollbar flex-1 overflow-auto">
					<slot />
				</div>
			{:else}
				<div class="scrollbar mb-36 mt-12 flex-1 overflow-auto">
					<slot />
				</div>
			{/if}
		</div>
	{:else}
		{#if !smallDevice}
			<div class="sticky top-0 z-10 border-b bg-background">
				<AccTopBar />
			</div>
		{:else}
			<div class="fixed inset-x-0 top-0 z-10 border-b bg-background">
				<AccTopBar />
			</div>
		{/if}
		<div class="flex flex-1 overflow-hidden">
			{#if !smallDevice}
				<div class="scrollbar flex-1 overflow-auto">
					<slot />
				</div>
			{:else}
				<div class="scrollbar mb-36 mt-12 flex-1 overflow-auto">
					<slot />
				</div>
			{/if}
		</div>
	{/if}
	{#if !smallDevice}
		<div bind:this={bottomDiv} class="sticky bottom-0 z-10 border-t bg-background transition">
			<BottomBar on:expand={expand} />
		</div>
	{:else}
		<div class="fixed inset-x-0 bottom-0 z-10 border-t bg-background" bind:this={bottomDiv}>
			<div class="mb-16 h-full">
				<BottomBar on:expand={expand} />
			</div>
			{#if !isExpanded}
				<div class="pb-safe absolute inset-x-0 bottom-0 bg-background">
					<MobileNavBar />
				</div>
			{/if}
		</div>
	{/if}
</div>
