<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { sources } from '$lib/store';

	let importing = true;
</script>

{#if $sources.length == 0}
	<h1 class="mt-4 scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">
		Add a Library
	</h1>
	<p class="mt-1 text-center text-sm text-muted-foreground">
		Select a folder containing your music.
	</p>
	<div class="mt-2 flex justify-center">
		<label
			for="real"
			class="cursor-pointer rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
		>
			<span class="transition-colors duration-200 ease-in-out">Select Library</span>
		</label>
		<Input class="hidden" id="real" type="file" webkitdirectory directory multiple />
	</div>

	{#if importing}
		<div class="mx-24 mt-6 flex justify-center rounded-lg border border-gray-300">
			<div>
				<h1 class="scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">Log</h1>
				<div class="mt-3 text-center text-muted-foreground">Importing...</div>
			</div>
		</div>
	{/if}
{:else}
	<p>loading...</p>
{/if}
