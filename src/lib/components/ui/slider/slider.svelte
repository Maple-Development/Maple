<script>
// @ts-nocheck

	import { Slider as SliderPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let className = undefined;
	export let value = [0];
	export let color = 'bg-blue-300';
	// @ts-ignore
	export let colors = [];
	export { className as class };
</script>

{#if colors?.[0]?.hex && colors?.[1]?.hex && colors?.[2]?.hex && colors} 
	<SliderPrimitive.Root
		bind:value
		class={cn('relative flex w-full touch-none select-none items-center', className)}
		{...$$restProps}
		let:thumbs
		>
		<span class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary" style="background: linear-gradient(to right, rgba({colors[0].red},{colors[0].green},{colors[0].blue},0.5), rgba({colors[1].red},{colors[1].green},{colors[1].blue},0.5));"
		>
			<SliderPrimitive.Range class="absolute h-full {color}" />
		</span>
		{#each thumbs as thumb}
			<SliderPrimitive.Thumb
				{thumb}
				class="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	</SliderPrimitive.Root>
{:else}
	<SliderPrimitive.Root
		bind:value
		class={cn('relative flex w-full touch-none select-none items-center', className)}
		{...$$restProps}
		let:thumbs
		>
		<span class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
			<SliderPrimitive.Range class="absolute h-full {color}" />
		</span>
		{#each thumbs as thumb}
			<SliderPrimitive.Thumb
				{thumb}
				class="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	</SliderPrimitive.Root>
{/if}
