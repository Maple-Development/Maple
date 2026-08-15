<script lang="ts">
	import { createLibrary, iosImportOpen, IOS_AUDIO_ACCEPT } from '$lib/library';

	let dragging = $state(false);

	function close() {
		iosImportOpen.set(false);
	}

	async function handleSelected(files: FileList | File[] | null | undefined) {
		if (!files || files.length === 0) return;
		close();
		await createLibrary(files);
	}

	function onInputChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		void handleSelected(input.files);
		input.value = '';
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		dragging = true;
	}

	function onDragLeave() {
		dragging = false;
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		void handleSelected(e.dataTransfer?.files);
	}
</script>

{#if $iosImportOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-70 flex items-end justify-center bg-black/50 px-4 pt-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0))] md:items-center md:pb-8"
		onclick={close}
	>
		<div
			class="bg-surface-container-high flex w-full max-w-md flex-col gap-4 rounded-2xl p-5 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-label="Upload music"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex flex-col gap-1">
				<h2 class="text-on-surface text-lg font-semibold">Upload music</h2>
				<p class="text-on-surface-variant text-sm">
					Select multiple audio files, or drag them here.
				</p>
			</div>

			<label
				class="bg-primary text-on-primary relative flex cursor-pointer items-center justify-center rounded-full px-4 py-3 text-sm font-semibold"
			>
				<input
					type="file"
					multiple
					accept={IOS_AUDIO_ACCEPT}
					class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					onchange={onInputChange}
				/>
				Choose files
			</label>

			<div
				class={[
					'text-on-surface-variant flex min-h-28 items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm',
					dragging ? 'border-primary bg-primary/10' : 'border-outline/40'
				]}
				ondragover={onDragOver}
				ondragleave={onDragLeave}
				ondrop={onDrop}
			>
				Drop audio files here
			</div>

			<button
				type="button"
				class="text-on-surface-variant hover:bg-surface-container-highest rounded-xl border-none bg-transparent px-4 py-2 text-sm font-medium"
				onclick={close}
			>
				Cancel
			</button>
		</div>
	</div>
{/if}
