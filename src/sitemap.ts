import type { RO_Sitemap } from 'sveltekit-sitemap';

export const sitemap = (<const>{
   "/": true,
   "/blah": false,
   "/tracks": false,
   "/upload": false
}) satisfies RO_Sitemap

export type Sitemap = typeof sitemap
