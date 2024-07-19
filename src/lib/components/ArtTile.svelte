<script lang="ts">
export let art;
export let onClick: () => void;
export let title;

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-col p-4" on:click={onClick}>
    <img
        class="h-full w-full rounded-lg object-cover max-h-64 max-w-64 sm:max-h-80 sm:max-w-80 md:max-h-96 md:max-w-96 lg:max-h-[30rem] lg:max-w-[30rem] xl:max-h-[35rem] xl:max-w-[35rem]" 
        src={art}
        alt="art"
    />
    <div class="flex flex-col">
        <p class="text-center text-lg py-2 px-2 line-clamp-1 overflow-hidden whitespace-nowrap overflow-ellipsis width-fit block">{title}</p>
    </div>
</div>
