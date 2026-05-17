// ==========================================================
//  NEO99 :: GRID — Feed Service Orchestrator
//
//  Owns the refresh schedule. Boots a kick-off fetch on
//  startup so the cache fills immediately, then re-fetches
//  on the configured interval.
// ==========================================================

import { sources, REFRESH_INTERVAL_MS } from './sources.js';
import { fetchSource } from './fetcher.js';
import { cache } from './cache.js';

let timer = null;

async function refreshOne(source) {
    const start = Date.now();
    try {
        const items = await fetchSource(source);
        cache.set(source.id, items);
        const elapsed = Date.now() - start;
        console.log(`  [feeds] ${source.id.padEnd(12)} ✓  ${String(items.length).padStart(2)} items  (${elapsed}ms)`);
    } catch (err) {
        cache.setError(source.id, err);
        console.error(`  [feeds] ${source.id.padEnd(12)} ✗  ${err.message}`);
    }
}

async function refreshAll() {
    console.log('  [feeds] refresh cycle starting...');
    await Promise.all(sources.map(refreshOne));
    console.log('  [feeds] refresh cycle complete.');
    console.log('');
}

// Boot — called once from server.js on startup
export function startFeedService() {
    console.log('');
    console.log('  [feeds] feed service starting');
    console.log(`  [feeds] ${sources.length} sources registered`);
    console.log(`  [feeds] refresh interval: ${REFRESH_INTERVAL_MS / 60000} minutes`);

    // Initial fire-and-forget refresh — don't block server boot
    refreshAll().catch(err => console.error('  [feeds] initial refresh failed:', err));

    // Schedule recurring refreshes
    timer = setInterval(() => {
        refreshAll().catch(err => console.error('  [feeds] scheduled refresh failed:', err));
    }, REFRESH_INTERVAL_MS);
}

export function stopFeedService() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

export { sources } from './sources.js';
export { cache } from './cache.js';