<script lang="ts">
    let { data }: { data: { artistId: string } } = $props();
</script>
  
<h1>Artist Slug: {data.artistId}</h1>
  