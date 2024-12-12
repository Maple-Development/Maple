<script lang="ts">
	import Button from './ui/button/button.svelte';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { OPFS } from '$lib/opfs';
	import { activeSong, audioPlayer, currentDuration, curTime, setCurTime } from '$lib/store';
	import Controls from './controls.svelte';
	import { onMount } from 'svelte';

	import { Play, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Pause } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let currentTime: number[];
	let one = false;
	let paused = false;
	$: volume = [100];
	let controls: Controls;
	$: currentTime = [0];
	$: maxDuration = [0];

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

	currentDuration.subscribe((duration) => {
		if (duration) {
			maxDuration = [duration];
		}
	});
	async function getImageUrl(imagePath: string): Promise<string> {
		const response = await OPFS.get().image(imagePath);
		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer]);
		return URL.createObjectURL(blob);
	}

	function pausePlay() {
		audioPlayer.update((state) => {
			if (state.audio instanceof HTMLAudioElement) {
				if (state.playing) {
					state.audio.pause();
				} else {
					state.audio.play();
				}
				return { ...state, playing: !state.playing, currentTime: state.audio.currentTime };
			} else {
				return state;
			}
		});
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

	let mouseOn = false;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<a on:click={() => handleScrub($curTime[0])} on:mouseup={() => handleScrub($curTime[0])}>
	<Slider
		color="bg-primary"
		bind:value={$curTime}
		bind:max={maxDuration[0]}
		step={0.1}
		class="z-10 ml-1 h-[2%] w-[98%]"
	></Slider>
</a>

<!-- scrub bar -->
<div class="relative flex h-[98%] items-center justify-between">
	<div class="flex">
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
			<div class="flex flex-col items-start">
				<Button
					variant="link"
					class="mt-5 font-bold text-md mb-0 p-0 h-fit underline-offset-1 py-0 px-0"
				>
					{$activeSong.title || 'Unknown'}
				</Button>
				<Button
					variant="link"
					class="mt-[-0.5rem] p-0 m-0 h-3 text-sm font-normal underline-offset-1 py-0 px-0 my-0"
				>
					{$activeSong.artist || 'Unknown'}
				</Button>
			</div>
		{:else}
		<img src="/temp/MapleD.svg" alt="gnx" class="h-20 self-center rounded-xl p-2" />
		<div class="flex flex-col items-start">
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

	<div class="mr-5 flex flex-grow justify-end">
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-missing-attribute -->
		<a on:click={() => changeVolume()} on:mouseup={() => changeVolume()}>
		<Slider bind:value={volume} max={100} step={2} class="w-40" />
		</a>
	</div>
</div>

<Controls bind:this={controls} />
