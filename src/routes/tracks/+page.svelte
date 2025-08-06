<script lang="ts">
    import type { Song } from '$lib/types';
    import Track from '$lib/components/Track.svelte';
    import { tracks } from '$lib/global.svelte';

    let sortedTracks: Song[] = $derived.by(() => [...tracks()].sort((a, b) => a.title.localeCompare(a.title)));
</script>
 

<div class="grid grid-cols-1 mx-24 gap-x-2 gap-y-2 sm:grid-cols-2 sm:gap-x-3 md:mx-16 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4 lg:gap-x-2 xl:grid-cols-5 xl:gap-x-2">
    {#each sortedTracks as track}
        <Track track={track} />
    {/each}
</div>
