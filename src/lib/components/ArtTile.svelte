<script lang="ts">
export let art;
export let onClick: () => void;
export let onContextMenu: (e: MouseEvent) => void;

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex" on:click={onClick} on:contextmenu|preventDefault={onContextMenu}>
    <img
        class="h-64 w-64 rounded-lg object-cover"  
        src={art}
        alt="art"
    />
</div>
