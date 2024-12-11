// Import necessary modules and functions from workbox and service-worker
// Note some of the libraries are inbuilt in Svelte so install only the missing ones
import { build, files, prerendered, version } from "$service-worker";
import { cacheNames, clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import * as navigationPreload from "workbox-navigation-preload";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import * as googleAnalytics from "workbox-google-analytics";

// Ensure that the current service worker takes control of the page as soon as possible
clientsClaim();

// Initialize Google Analytics tracking for your service worker (though it is to be depreciated)
// This helps queue tracking request when offline and forward them when the network is back
// if your not using analytics; you can remove this line and its import.
googleAnalytics.initialize();

// Enable navigation preloading to improve the performance of navigation requests
// We will be using this instead of Svelte's hence the conversion of links to reload instead of preload
navigationPreload.enable();

// Define cache names for navigation and dynamic content
// This also help with cache versioning
const navigationCacheName = `${cacheNames.prefix}-navigations-${cacheNames.suffix}`;
const dynamicContentCacheName = `${cacheNames.prefix}-dynamic-content-${cacheNames.suffix}`;

// Create a new navigation route with a NetworkFirst strategy, which will try the network first and fall back to the cache if needed
// This will handle all the routes except the dynamic ones
const navigationRoute = new NavigationRoute(new NetworkFirst({
cacheName: navigationCacheName,
plugins: [
new CacheableResponsePlugin({ statuses: [0, 200] }), // Only cache responses with a status of 0 or 200
new ExpirationPlugin({
maxAgeSeconds: 24 * 60 * 60 * 7, // Cache entries will be deleted after 7 days
purgeOnQuotaError: true // If the cache is full, delete the oldest entries to make space for new ones
})
]
}));

// Register the navigation route
registerRoute(navigationRoute);

// Create a new StaleWhileRevalidate strategy for dynamic content, which will serve cached responses immediately and update them in the background
const dynamicContentStrategy = new StaleWhileRevalidate({
cacheName: dynamicContentCacheName,
plugins: [
new CacheableResponsePlugin({ statuses: [0, 200] }), // Only cache responses with a status of 0 or 200
new ExpirationPlugin({
maxAgeSeconds: 24 * 60 * 60 * 7, // Cache entries will be deleted after 7 days
purgeOnQuotaError: true // If the cache is full, delete the oldest entries to make space for new ones
})
]
});

// Register the dynamic content strategy for any URL that starts with "/post"
// For example in this case the url is "https://www.example.com/post?id=681d6afa-2fab-401c-a8ea-22bd3a496723"
registerRoute(
({ url }) => url.pathname.startsWith("/post"),
dynamicContentStrategy
);

// Create a list of URLs to precache based on the build, files, and prerendered arrays from the service-worker module
const precacheList = [...build, ...files, ...prerendered].map((s) => ({
url: s,
revision: version
}));

// Precache and route the URLs in the precacheList
precacheAndRoute(precacheList);

// Clean up outdated caches that are no longer needed
cleanupOutdatedCaches();