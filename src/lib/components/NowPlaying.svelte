<script lang="ts">
	import { activeSong, activeArt } from '$lib/store';

</script>

{#if $activeSong && $activeSong.title}
		<h1>Now Playing: {$activeSong.title}</h1>
		<p>{$activeSong.artist}</p>
		<img
        class="h-64 w-64 rounded-lg object-cover"  
        src={$activeArt.image}
        alt="art"
    	/>
{:else}
	<h1>No song playing</h1>
{/if}
