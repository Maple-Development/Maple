<script lang="ts">
	import { activeSong, activeArt } from '$lib/store';
	import { backIn } from 'svelte/easing';
	import Button from './ui/button/button.svelte';
	import { Play, Pause, SkipForward, SkipBack } from 'lucide-svelte';

	let playing = false;

	async function play() {

	}

	async function pause() {

	}

	async function next() {

	}

	async function previous() {

	}
</script>

{#if $activeSong && $activeSong.title}
	<div class="flex flex-col items-center justify-center mt-20 sticky">
		<img
			class="h-full w-full rounded-lg object-cover max-h-60 max-w-60 sm:max-h-76 sm:max-w-76 md:max-h-92 md:max-w-92 lg:max-h-[28rem] lg:max-w-[28rem] xl:max-h-[32rem] xl:max-w-[32rem]"  
			src={$activeArt.image}
			alt="art"
		/>
		<h1 class="text-3xl font-bold">{$activeSong.title}</h1>
		<p class="text-lg font-light italic">{$activeSong.artist}</p>
		<p class="text-lg font-light italic">{$activeSong.album}</p>
	</div>

	<div class="flex justify-center mt-4">
		<Button
			variant="outline"
			class="w-12 h-12 rounded-full mr-4"
			on:click={() => {
				if ($activeSong) {
					previous();
				}
			}}
		>
			<SkipBack size={16} color="white" />
		</Button>
		<Button
			variant="outline"
			class="w-12 h-12 rounded-full mr-4"
			on:click={() => {
				if ($activeSong) {
					playing = !playing;
				}
			}}
		>
			{#if playing}
				<Pause size={16} color="white" />
			{:else}
				<Play size={16} color="white" />
			{/if}
		</Button>
		<Button
			variant="outline"
			class="w-12 h-12 rounded-full"
			on:click={() => {
				if ($activeSong) {
					next();
				}
			}}
		>
			<SkipForward size={16} color="white" />
		</Button>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center mt-20">
		<h1>No song playing</h1>
	</div>
{/if}

