<script>
// @ts-nocheck

  import "../app.pcss";
  import NowPlaying from "$lib/components/NowPlaying.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
</script>

<div class="flex flex-col h-screen">
    <div class="border-b border-gray-300">
        <TopBar />
    </div>
  <div class="flex flex-1 mt-1/10">
    <div class="w-3/5">
      <slot />
    </div>
    <div class="w-2/5 border-l border-gray-300">
        <NowPlaying />
    </div>
  </div>
</div>