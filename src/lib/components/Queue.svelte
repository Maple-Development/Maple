<script lang="ts">
	import { queueState } from '$lib/store';
	import { get } from 'svelte/store';
	import ListTrack from '$lib/components/ListTrack.svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import type { Song } from '$lib/types';

	let dragIndex = $state<number | null>(null);
	let dropIndex = $state<number | null>(null);
	let canDrag = $state(true);
	let itemsCache = $state<Song[]>([]);

	$effect(() => {
		const currentItems = $queueState.items;
		const itemsChanged = itemsCache.length !== currentItems.length ||
			itemsCache.some((item, i) => item.id !== currentItems[i]?.id);
		
		if (itemsChanged) {
			itemsCache = [...currentItems];
		}
	});

	function moveQueueItem(fromIndex: number, toIndex: number) {
		const state = get(queueState);
		if (fromIndex === toIndex) return;
		if (fromIndex < 0 || toIndex < 0 || fromIndex >= state.items.length || toIndex >= state.items.length)
			return;

		const next = [...state.items];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);

		let newCurrentIndex = state.currentIndex;
		if (state.currentIndex === fromIndex) {
			newCurrentIndex = toIndex;
		} else if (state.currentIndex > fromIndex && state.currentIndex <= toIndex) {
			newCurrentIndex = state.currentIndex - 1;
		} else if (state.currentIndex < fromIndex && state.currentIndex >= toIndex) {
			newCurrentIndex = state.currentIndex + 1;
		}

		queueState.set({
			items: next,
			currentIndex: newCurrentIndex,
			source: state.source
		});
		itemsCache = [...next];
	}

	function removeQueueItem(index: number) {
		const state = get(queueState);
		if (index < 0 || index >= state.items.length) return;

		const next = state.items.filter((_, i) => i !== index);
		let newCurrentIndex = state.currentIndex;

		if (index < state.currentIndex) {
			newCurrentIndex = state.currentIndex - 1;
		} else if (index === state.currentIndex && next.length > 0) {
			newCurrentIndex = Math.min(state.currentIndex, next.length - 1);
		} else if (next.length === 0) {
			newCurrentIndex = -1;
		}

		queueState.set({
			items: next,
			currentIndex: newCurrentIndex,
			source: state.source
		});
		itemsCache = [...next];
	}

	if (typeof window !== 'undefined') {
		canDrag = !window.matchMedia('(pointer: coarse)').matches;
	}
</script>

<div class="fixed inset-0 bottom-30 left-23 bg-secondary-container overflow-y-auto p-6">
	<div class="flex flex-col gap-6">
		<h1 class="text-on-surface text-2xl font-bold">Queue</h1>
		<div class="bg-surface-container rounded-xl">
			<ul class="divide-outline-variant divide-y">
				{#each itemsCache as item, index (item.id)}
					<li
						animate:flip={{ duration: 300, easing: cubicOut }}
						class={$queueState.currentIndex === index ? 'bg-primary-container/30' : ''}
					>
						<ListTrack
							track={item}
							index={index + 1}
							trackNo={item.trackNumber}
							showThumbnail={true}
							showDropIndicator={dropIndex === index + 1}
							onRemove={() => removeQueueItem(index)}
							draggable={canDrag}
							playbackContext={itemsCache}
							playbackSource={$queueState.source}
							onDragStart={(e) => {
								if (!canDrag) return;
								dragIndex = index;
								dropIndex = index + 1;
								e.dataTransfer?.setData('text/plain', String(index));
								e.dataTransfer?.setDragImage(e.currentTarget as Element, 16, 16);
							}}
							onDragOver={(e) => {
								if (!canDrag) return;
								e.preventDefault();
								e.dataTransfer && (e.dataTransfer.dropEffect = 'move');
								dropIndex = index + 1;
							}}
							onDrop={(e) => {
								if (!canDrag) return;
								e.preventDefault();
								const fromIndex = dragIndex ?? Number(e.dataTransfer?.getData('text/plain'));
								const targetIndex = index;
								dragIndex = null;
								dropIndex = null;
								if (Number.isFinite(fromIndex)) {
									const adjustedTarget = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
									moveQueueItem(fromIndex, Math.max(0, adjustedTarget));
								}
							}}
							onDragEnd={() => {
								dragIndex = null;
								dropIndex = null;
							}}
						/>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>