<script lang="ts">
    import { OPFS } from "$lib/opfs";
    import type { Song } from "$lib/types/song";
    import { context, activeSong, audioPlayer } from "$lib/store";
    export let track: Song;
    export let tracks: Song[];

    let audioUrl: string = "";
    async function play() {
        context.set(tracks);
        activeSong.set(track);
        const buffer = await OPFS.getSong(track);
        if (buffer) {
            const arrayBuffer = await buffer.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: `audio/${track.ext}` });
            audioUrl = URL.createObjectURL(blob);
        }
        audioPlayer.update((state) => {
          if (state.audio instanceof HTMLAudioElement) {
            state.audio.src = audioUrl;
            state.audio.play();
          }
          return { ...state, playing: true };
        });
    } 
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={() => play()}>
  <slot />
</div>
