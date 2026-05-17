// ==========================================================
//  NEO99 :: GRID — Telemetry Counter
//
//  In-memory counters for the operator console HUD.
//  Survives the lifetime of the server process; resets on
//  restart. Phase 4 will optionally back this with Azure
//  Table Storage for persistence across deployments.
// ==========================================================

class TelemetryCounter {
    constructor() {
        this.bootTime    = Date.now();
        this.visitors    = 0;       // increments per visitor session
        this.commands    = 0;       // increments per command dispatch
        this.feedFetches = 0;       // increments per feed refresh
        this.seenSessions = new Set();   // tracks already-counted sessions
    }

    // Called by middleware. Counts a visitor once per session id.
    bumpVisitor(sessionId) {
        if (!sessionId || this.seenSessions.has(sessionId)) return;
        this.seenSessions.add(sessionId);
        this.visitors++;
    }

    bumpCommand() {
        this.commands++;
    }

    bumpFeedFetch() {
        this.feedFetches++;
    }

    // Returns a full snapshot of current state.
    snapshot() {
        const uptimeMs = Date.now() - this.bootTime;
        const memUsage = process.memoryUsage();

        return {
            status:      'online',
            bootTime:    new Date(this.bootTime).toISOString(),
            uptimeMs,
            visitors:    this.visitors,
            commands:    this.commands,
            feedFetches: this.feedFetches,
            memory: {
                heapUsedMB: +(memUsage.heapUsed / 1024 / 1024).toFixed(1),
                rssMB:      +(memUsage.rss      / 1024 / 1024).toFixed(1),
            },
            node: process.version,
        };
    }
}

// Singleton — the canonical counter for the whole app.
export const telemetry = new TelemetryCounter();