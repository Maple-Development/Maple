<script lang="ts">
	import Button from './ui/button/button.svelte';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { OPFS } from '$lib/opfs';
	import { activeSong, audioPlayer, currentDuration, curTime, setCurTime } from '$lib/store';
	import Controls from './controls.svelte';
	import { onMount } from 'svelte';

	import {
		Play,
		SkipForward,
		SkipBack,
		Shuffle,
		Repeat,
		Repeat1,
		Pause,
		ChevronUp,
		ChevronDown
	} from 'lucide-svelte';
	import { browser } from '$app/environment';

	import { extractColors } from 'extract-colors';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let currentTime: number[];
	let one = false;
	let paused = false;
	$: volume = [100];
	let controls: Controls;
	$: currentTime = [0];
	$: maxDuration = [0];

	let isCollapsed = true;

	$: {
		if ($audioPlayer) {
			paused = !$audioPlayer.playing;
		}
	}

	onMount(async () => {
		audioPlayer.subscribe((value) => {
			if (value.audio instanceof HTMLAudioElement && value.currentTime !== undefined) {
				currentTime = [value.audio.currentTime];
			}
		});
	});

	let colors: {
		[x: string]: any;
		hex: any;
	}[];

	currentDuration.subscribe((duration) => {
		if (duration) {
			maxDuration = [duration];
		}
	});
	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		colors = await extractColors(URL.createObjectURL(blob));
		return URL.createObjectURL(blob);
	}

	function pausePlay() {
		controls.pausePlay();
	}

	function nextSong() {
		controls.nextSong();
	}

	function prevSong() {
		controls.prevSong();
	}

	function changeVolume() {
		//volume is an [], should only take number, who knows why this works rn but it does so ima just ignore warning :skull:
		//@ts-ignore
		controls.volume(volume);
	}

	function handleScrub(value: number) {
		if (value !== $setCurTime[0]) {
			curTime.set([value]);
			audioPlayer.update((state) => {
				if (state.audio instanceof HTMLAudioElement) {
					state.audio.currentTime = value;
					return { ...state, currentTime: value };
				}
				return state;
			});
		}
	}

	function drawerUp() {
		dispatch('expand');
		isCollapsed = !isCollapsed;
	}

	let mouseOn = false;
</script>

{#if isCollapsed}
	{#if colors?.[0]?.hex && colors?.[1]?.hex}
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<a on:click={() => handleScrub($curTime[0])} on:mouseup={() => handleScrub($curTime[0])}>
			<Slider
				color="bg-primary"
				bind:value={$curTime}
				bind:max={maxDuration[0]}
				step={0.1}
				class="z-10 ml-0 h-[2%] w-[100%] pr-0"
				{colors}
			></Slider>
		</a>
	{:else}
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<a on:click={() => handleScrub($curTime[0])} on:mouseup={() => handleScrub($curTime[0])}>
			<Slider
				color="bg-primary"
				bind:value={$curTime}
				bind:max={maxDuration[0]}
				step={0.1}
				class="z-10 ml-4 h-[2%] w-[100%] pr-8"
			></Slider>
		</a>
	{/if}

	<div class="relative flex h-[98%] items-center justify-between">
		<div class="ml-2 flex sm:ml-0">
			{#if $activeSong.title}
				{#await getImageUrl($activeSong.image)}
					<div class="ml-1 h-20 w-20 self-center rounded-xl bg-gray-500"></div>
				{:then image}
					<img src={image} alt={$activeSong.title} class="h-20 self-center rounded-xl p-2" />
				{:catch error}
					<img
						src="/temp/MapleD.svg"
						alt={$activeSong.title}
						class="h-20 self-center rounded-xl p-2"
					/>
				{/await}
				<div class="hidden flex-col items-start sm:flex">
					<Button variant="link" class="mt-5 font-bold text-md mb-0 p-0 h-fit underline-offset-1 py-0 px-0">{$activeSong.title || 'Unknown Title'}</Button>
					<Button variant="link" class="mt-[-0.5rem] p-0 m-0 h-3 text-sm font-normal underline-offset-1 py-0 px-0 my-0">{$activeSong.artist || 'Unknown Artist'}</Button>
				</div>
			{:else}
				<img src="/temp/MapleD.svg" alt="gnx" class="h-20 self-center rounded-xl p-2" />
				<div class="hidden flex-col items-start sm:flex">
					<Button variant="link" class="mt-5 font-bold text-md mb-0 p-0 h-fit underline-offset-1 py-0 px-0">Nothing Playing</Button>
					<Button variant="link" class="mt-[-0.5rem] p-0 m-0 h-3 text-sm font-normal underline-offset-1 py-0 px-0 my-0">...</Button>
				</div>
			{/if}
		</div>
		<div class="absolute left-1/2 flex -translate-x-1/2 transform items-center justify-center">
			<Button
				disabled
				class="flex h-fit w-fit flex-row items-center justify-start bg-transparent p-2 hover:bg-secondary"
			>
				<Shuffle size={15} class="text-foreground" />
			</Button>
			<Button
				on:click={prevSong}
				class="flex h-fit w-fit flex-row items-center justify-start bg-transparent p-2 hover:bg-secondary"
			>
				<SkipBack size={25} class="text-foreground" />
			</Button>
			<Button
				on:click={pausePlay}
				class="flex h-fit w-fit flex-row items-center justify-start bg-transparent p-2 hover:bg-secondary"
			>
				{#if !paused}
					<Pause size={25} class="text-foreground" />
				{:else}
					<Play size={25} class="text-foreground" />
				{/if}
			</Button>
			<Button
				on:click={nextSong}
				class="flex h-fit w-fit flex-row items-center justify-start bg-transparent p-2 hover:bg-secondary"
			>
				<SkipForward size={25} class="text-foreground" />
			</Button>
			<Button
				disabled
				class="flex h-fit w-fit flex-row items-center justify-start bg-transparent p-2 hover:bg-secondary"
			>
				{#if one}
					<Repeat1 size={15} class="text-foreground" />
				{:else}
					<Repeat size={15} class="text-foreground" />
				{/if}
			</Button>
		</div>

		<div class="mr-5 hidden flex-grow justify-end sm:flex">
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-missing-attribute -->
			<a on:click={() => changeVolume()} on:mouseup={() => changeVolume()}>
				<Slider bind:value={volume} max={100} step={2} class="w-40" />
			</a>
		</div>
		<div class="mr-4 flex justify-end sm:hidden">
			<Button
				on:click={drawerUp}
				variant="secondary"
				class="flex h-fit w-fit flex-row items-center justify-start rounded-[50%] p-2"
			>
				<ChevronUp size={25} class="text-foreground" />
			</Button>
		</div>
	</div>
{:else}
	<div class="relative flex h-[98%] flex-col items-center bg-background/95 backdrop-blur-sm">
		<div class="w-full px-4">
			{#if colors?.[0]?.hex && colors?.[1]?.hex}
				<div
					class="mb-4 mt-2 flex w-full justify-center rounded-xl p-2"
					style="background: linear-gradient(to right, rgba({colors[0].red},{colors[0].green},{colors[0].blue},0.5), rgba({colors[1].red},{colors[1].green},{colors[1].blue},0.5));"
				>
					{#await getImageUrl($activeSong.image)}
						<div class="h-64 w-64 rounded-xl bg-gray-500"></div>
					{:then image}
						<img src={image} alt={$activeSong.title} class="h-64 w-64 rounded-xl" />
					{:catch error}
						<img src="/temp/MapleD.svg" alt={$activeSong.title} class="h-64 w-64 rounded-xl" />
					{/await}
				</div>
			{:else}
				<div class="mb-4 mt-2 flex w-full justify-center rounded-xl bg-gradient-to-r from-gray-500 to-gray-700 p-2">
					{#await getImageUrl($activeSong.image)}
						<div class="h-64 w-64 rounded-xl bg-gray-500"></div>
					{:then image}
						<img src={image} alt={$activeSong.title} class="h-64 w-64 rounded-xl" />
					{:catch error}
						<img src="/temp/MapleD.svg" alt={$activeSong.title} class="h-64 w-64 rounded-xl" />
					{/await}
				</div>
			{/if}
		</div>

		<div class="w-full px-4">
			<div class="mb-4">
				<Slider
					color="bg-primary"
					bind:value={$curTime}
					bind:max={maxDuration[0]}
					step={0.1}
					class="w-full"
				></Slider>
			</div>

			<div class="flex items-center justify-center">
				<div class="flex items-center space-x-4">
					<Button
						disabled
						variant="ghost"
						class="h-10 w-10 p-0"
					>
						<Shuffle size={20} class="text-foreground" />
					</Button>
					<Button
						on:click={prevSong}
						variant="ghost"
						class="h-10 w-10 p-0"
					>
						<SkipBack size={24} class="text-foreground" />
					</Button>
					<Button
						on:click={pausePlay}
						variant="ghost"
						class="h-12 w-12 p-0"
					>
						{#if !paused}
							<Pause size={28} class="text-foreground" />
						{:else}
							<Play size={28} class="text-foreground" />
						{/if}
					</Button>
					<Button
						on:click={nextSong}
						variant="ghost"
						class="h-10 w-10 p-0"
					>
						<SkipForward size={24} class="text-foreground" />
					</Button>
					<Button
						disabled
						variant="ghost"
						class="h-10 w-10 p-0"
					>
						{#if one}
							<Repeat1 size={20} class="text-foreground" />
						{:else}
							<Repeat size={20} class="text-foreground" />
						{/if}
					</Button>
				</div>
			</div>
		</div>

		<div class="absolute bottom-0 w-full border-t border-border bg-background/95 px-4 py-2">
			<div class="flex h-12 items-center justify-between">
				<div class="flex items-center space-x-3">
					{#if $activeSong.title}
						{#await getImageUrl($activeSong.image)}
							<div class="h-10 w-10 rounded-lg bg-gray-500"></div>
						{:then image}
							<img src={image} alt={$activeSong.title} class="h-10 w-10 rounded-lg" />
						{:catch error}
							<img src="/temp/MapleD.svg" alt={$activeSong.title} class="h-10 w-10 rounded-lg" />
						{/await}
						<div class="flex flex-col">
							<span class="text-sm font-semibold">{$activeSong.title || 'Unknown'}</span>
							<span class="text-xs text-muted-foreground">{$activeSong.artist || 'Unknown'}</span>
						</div>
					{/if}
				</div>
				<Button
					on:click={drawerUp}
					variant="ghost"
					class="h-8 w-8 p-0"
				>
					<ChevronDown size={20} class="text-foreground" />
				</Button>
			</div>
		</div>
	</div>
{/if}

<Controls bind:this={controls} />
