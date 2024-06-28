import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const sources = writable([]);

if (browser) {
    // @ts-ignore
    sources.set(JSON.parse(localStorage.getItem('sources')) || []);
    
    sources.subscribe((value) => {
        localStorage.setItem('sources', JSON.stringify(value));
    });
}