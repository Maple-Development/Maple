<script lang="ts">
    import type { Song } from '$lib/types';
    import Track from '$lib/components/Track.svelte';
    import Filters from '$lib/components/Filters.svelte';
    import { tracks } from '$lib/global.svelte';
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';

    let sortedTracks: Song[] = $state(tracks());

    function handleFiltersChange(payload: { sorted: Song[]; sortKey: string; descending: boolean }) {
        sortedTracks = payload.sorted;
    }
</script>

<Filters
    items={tracks()}
    sortOptions={[
        { key: 'title', label: 'Title' },
        { key: 'artist', label: 'Artist' },
        { key: 'album', label: 'Album' },
        { key: 'year', label: 'Year' },
        { key: 'duration', label: 'Duration' }
    ]}
    initialSortKey="title"
    onChange={handleFiltersChange}
/>

<div class="grid grid-cols-1 mx-24 gap-x-2 gap-y-2 sm:grid-cols-2 sm:gap-x-3 md:mx-16 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4 lg:gap-x-2 xl:grid-cols-5 xl:gap-x-2">
    {#each sortedTracks as track (track.id)}
        <div class="will-change-transform" animate:flip={{ duration: 300, easing: cubicOut }}>
            <Track track={track as Song} />
        </div>
    {/each}
</div>
