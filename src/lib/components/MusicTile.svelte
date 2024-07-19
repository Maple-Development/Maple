<script lang="ts">
export let image: any;
export let title: string;
export let artist: string;
export let album: string;
export let onClick: () => void;
export let onContextMenu: (e: MouseEvent) => void;

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-col" on:click={onClick} on:contextmenu|preventDefault={onContextMenu}>
    <img
        class="h-64 w-64 rounded-lg object-cover hidden"  
        src={image}
        alt={title}
    />
    <div class="flex flex-col border border-gray-300">
        <p class="text-center text-xl font-bold">{title}</p>
        <p class="text-center text-md text-red-400">{artist}</p>
        <p class="text-center text-md text-blue-400">{album}</p>
    </div>
</div>