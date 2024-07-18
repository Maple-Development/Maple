<script lang="ts">
export let image: any;
export let title: string;
export let artist: string;
export let album: string;
export let onClick: () => void;
export let onContextMenu: (e: MouseEvent) => void;

</script>

<div class="flex flex-col" on:click={onClick} on:contextmenu|preventDefault={onContextMenu}>
    <img
        class="h-64 w-64 rounded-lg object-cover"  
        src={image}
        alt={title}
    />
    <p class="text-center text-xl">{title}</p>
    <p class="text-center text-xl">{artist}</p>
    <p class="text-center text-xl">{album}</p>
</div>