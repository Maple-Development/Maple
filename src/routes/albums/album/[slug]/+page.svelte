<script lang="ts">
    let { data }: { data: { albumId: string } } = $props();
</script>
  
<h1>Album Slug: {data.albumId}</h1>
  