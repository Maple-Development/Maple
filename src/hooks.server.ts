import type { Handle } from '@sveltejs/kit';
import { sitemapHook } from 'sveltekit-sitemap';
import { sitemap } from './sitemap';

export const handle: Handle = async ({ event, resolve }) => {
	return sitemapHook(sitemap)({ event, resolve });
};
