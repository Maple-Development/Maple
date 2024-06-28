<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { sources } from "$lib/store";


</script>

{#if $sources.length == 0}
<h1 class="text-center mt-4">It seems you haven't added a library yet.</h1>
<div class="flex justify-center mt-2">
    <label for="real" class="cursor-pointer inline-block border-2 border-primary rounded-lg text-primary px-12 py-8 text-center hover:border-transparent hover:bg-secondary hover:shadow-lg transition duration-150 ease-in-out">Select Library</label>
    <Input class="hidden" id="real" type="file" webkitdirectory directory multiple />
  </div>
<h1 class="text-center mt-2">Please select your music folder or pre-exisiting library.</h1>
{:else}
  <p>loading...</p>
{/if}