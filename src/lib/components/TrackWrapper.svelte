<script lang="ts">
	import type { Song } from '$lib/types/song';
	import { context } from '$lib/store';
	import Controls from './controls.svelte';
	export let track: Song;
	export let tracks: Song[];
	export let className: string;

	let controls: Controls;

	async function playSong(song: Song) {
		context.set(tracks);
		controls.playSong(song);
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class={className} on:click={() => playSong(track)}>
	<slot />
</div>

<Controls bind:this={controls} />
