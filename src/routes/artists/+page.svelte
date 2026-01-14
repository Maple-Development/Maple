<script lang="ts">
    import type { Artist } from '$lib/types';
    import Track from '$lib/components/Track.svelte';
    import Filters from '$lib/components/Filters.svelte';
    import { artists } from '$lib/global.svelte';
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    import { title } from '$lib/store';

    let sortedArtists: Artist[] = $state(artists());

    function handleFiltersChange(payload: { sorted: Artist[]; sortKey: string; descending: boolean }) {
        sortedArtists = payload.sorted;
    }

    onMount(async () => {
		title.set('Artists');
	});
</script>

<Filters
    items={artists()}
    sortOptions={[{ key: 'name', label: 'Name' }]}
    initialSortKey="name"
    onChange={handleFiltersChange}
/>

<div class="grid grid-cols-1 mx-24 gap-x-2 gap-y-2 sm:grid-cols-2 sm:gap-x-3 md:mx-16 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4 lg:gap-x-2 xl:grid-cols-5 xl:gap-x-2">
    {#each sortedArtists as artist (artist.id)}
        <div class="will-change-transform" animate:flip={{ duration: 300, easing: cubicOut }}>
            <Track artist={artist as Artist} type="artist" />
        </div>
    {/each}
</div>
