<script lang="ts">
	import Button from './ui/button/button.svelte';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { OPFS } from '$lib/opfs';
	import { activeSong, audioPlayer, currentDuration, curTime } from '$lib/store';
	import Controls from './controls.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import { Play, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Pause } from 'lucide-svelte';

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
		})
	})

	currentDuration.subscribe((duration) => {
		if (duration) {
			console.log(duration);
			console.log($currentDuration);
			maxDuration = [duration];
		}
	})
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
					console.log($curTime + " ermm " + state.audio.currentTime);
					state.audio.pause();
					paused = true;
					return { ...state, playing: false };
				} else {
					console.log($curTime + "ermm " + state.audio.currentTime);
					state.audio.play();
					paused = false;
					return { ...state, playing: true };
				}
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

	$: {
		if (currentTime !== undefined && currentTime[0] !== 0) {
			scrub();
		}
	}

	$: {
		if ($curTime) {
			console.log("cir " + $curTime);
		}
	}

	function scrub() {
		console.log(currentTime);
		controls.currentTime(currentTime[0]);
	}

	function testLog() {
		console.log("real");
	}
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mouseup={testLog}>
<Slider color="bg-primary" bind:value={$curTime} bind:max={maxDuration} step={1} class="h-[2%] w-[98%] z-10 ml-1"></Slider>
</div>
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
					src="/temp/gnx_album.png"
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
				<img src="/temp/gnx_album.png" alt="gnx" class="h-20 self-center rounded-xl p-2" />
				<div class="flex flex-col items-start">
					<Button variant="link" class="mt-5 font-bold text-md mb-0 p-0 h-fit underline-offset-1 py-0 px-0">GNX</Button>
					<Button variant="link" class="mt-[-0.5rem] p-0 m-0 h-3 text-sm font-normal underline-offset-1 py-0 px-0 my-0">Kendrick Lamar</Button>
				</div>
		{/if}
	</div>
	<div class="absolute left-1/2 flex -translate-x-1/2 transform items-center justify-center">
		<Button disabled
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
		<Button disabled
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
		<Slider onValueChange={changeVolume} bind:value={volume} max={100} step={2} class="w-40" />
	</div>
</div>

<Controls bind:this={controls} />
