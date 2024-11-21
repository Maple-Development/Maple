<script lang="ts">
    import { browser } from '$app/environment';
    let e: any;
    let duration;
    let paused: any;
    let time;
    export let volume: any;
    export function setVolume(e: any) {
        volume = e
        console.log(volume)
    }
    
        if (browser) {
            window.addEventListener('message', (event) => {
                if (event.origin !== window.location.origin) {
                    return;
                }
    
                const data = event.data;
                if (data !== 'pause') {
                return;
                }
                if (paused === true) {
                    paused = false;
                } else {
                    paused = true;
                }
            }); 
        }
    </script>
    
        <audio
            src=""
            bind:currentTime={e}
            bind:duration
            bind:paused
            bind:volume
            preload="metadata"
            on:ended={() => {
                let messageData = 'ended';
                  window.postMessage(messageData, window.location.href);
            }}
        />