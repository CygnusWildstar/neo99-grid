// ==========================================================
//  NEO99 :: GRID — Feed Cache
//
//  In-memory store for normalized feed items, keyed by
//  source id. Single source of truth that the API and the
//  scheduler share.
//
//  Phase 4 will swap this implementation for Azure Table
//  Storage. The interface stays the same.
// ==========================================================

class FeedCache {
    constructor() {
        // sourceId → { items: [...], updatedAt: ISO string, error: string|null }
        this.store = new Map();
    }

    set(sourceId, items) {
        this.store.set(sourceId, {
            items,
            updatedAt: new Date().toISOString(),
            error: null,
        });
    }

    setError(sourceId, error) {
        const existing = this.store.get(sourceId) || { items: [] };
        this.store.set(sourceId, {
            items: existing.items,                              // keep last-known-good items
            updatedAt: existing.updatedAt || null,
            error: error.message || String(error),
        });
    }

    get(sourceId) {
        return this.store.get(sourceId) || null;
    }

    getAll() {
        const result = {};
        for (const [id, entry] of this.store.entries()) {
            result[id] = entry;
        }
        return result;
    }

    isReady() {
        // Considered ready once at least one source has data
        for (const entry of this.store.values()) {
            if (entry.items && entry.items.length > 0) return true;
        }
        return false;
    }
}

// Single shared instance — the canonical cache for the whole app
export const cache = new FeedCache();