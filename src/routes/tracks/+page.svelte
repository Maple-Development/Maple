<script>
    // @ts-ignore
    import {currentSongs, currentArtTile} from '$lib/store.ts';
    import ArtTile from '$lib/components/ArtTile.svelte';
	import * as ContextMenu from "$lib/components/ui/context-menu";
</script>


{#if $currentArtTile.length < 1 && $currentSongs.length == 0}
		<h1 class="mt-4 scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl"> Error, no art found </h1>
	{:else}
		<div class="mx-10 mt-6 flex justify-center rounded-lg">		
			<div>
				<h1 class="scroll-m-20 text-center text-3xl font-bold tracking-tight lg:text-3xl">
					{$currentArtTile.length} Songs Found
				</h1>
				<div class="flex flex-wrap -mx-4">
					
					{#each $currentArtTile as art}
							<div class="flex-shrink-0 md:w-1/2 lg:w-1/4">
								<ContextMenu.Root>
									<ContextMenu.Trigger><ArtTile
										art={art.image}
										onClick={() => {}}
										title={art.title}
										fileName={art.fileName}
										id={art.id}
									/></ContextMenu.Trigger>
									<ContextMenu.Content>
                                      <ContextMenu.Item>Set Active</ContextMenu.Item>
									</ContextMenu.Content>
								</ContextMenu.Root>
							</div>
					{/each}
				 
				</div>
			</div>
		</div>
	{/if}