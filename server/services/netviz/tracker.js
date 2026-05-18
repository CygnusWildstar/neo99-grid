// ==========================================================
//  NEO99 :: GRID — Network Activity Tracker
//
//  Lightweight in-memory tracker for the netviz panel.
//  Maintains a rolling 30-second window of HTTP requests
//  excluding the visualizer's own polling endpoints.
// ==========================================================

const WINDOW_MS = 30 * 1000;        // 30-second rolling window
const MAX_RECENT = 50;               // cap on recent events buffer
const EXCLUDED_PATHS = new Set([
    '/api/netviz',
    '/api/sysinfo',
    '/api/telemetry',
    '/healthz',
    '/favicon.ico',
]);

// Rolling state
const recent = [];                   // [{ ts, method, path, status }]
const routeCounts = new Map();       // path -> hit count (lifetime)
let errorCount = 0;                  // 4xx/5xx since boot
let totalCount = 0;                  // all requests since boot

/**
 * Record a single HTTP request. Called from Express middleware
 * after the response finishes so we have the final status code.
 */
function record(req, res) {
    const path = req.path || req.url || '/';
    if (EXCLUDED_PATHS.has(path)) return;

    // Skip static assets (.css, .js, .png, etc.) to keep signal clean
    if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|map)$/.test(path)) {
        return;
    }

    const ts = Date.now();
    const status = res.statusCode || 0;

    recent.push({ ts, method: req.method, path, status });
    if (recent.length > MAX_RECENT) recent.shift();

    routeCounts.set(path, (routeCounts.get(path) || 0) + 1);
    totalCount += 1;
    if (status >= 400) errorCount += 1;
}

/**
 * Return a snapshot of activity for the /api/netviz endpoint.
 * Prunes anything outside the rolling window first.
 */
function snapshot() {
    const cutoff = Date.now() - WINDOW_MS;
    // Drop expired events from the recent buffer
    while (recent.length && recent[0].ts < cutoff) recent.shift();

    // Top routes by lifetime hit count
    const topRoutes = [...routeCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count }));

    return {
        recent: recent.slice(),       // copy to prevent mutation
        windowMs: WINDOW_MS,
        reqsInWindow: recent.length,
        totalSinceBoot: totalCount,
        errorsSinceBoot: errorCount,
        topRoutes,
    };
}

/**
 * Express middleware that wires this tracker into the request lifecycle.
 * Hooks the response 'finish' event so we capture the final status.
 */
function middleware() {
    return (req, res, next) => {
        res.on('finish', () => record(req, res));
        next();
    };
}

export const netviz = { record, snapshot, middleware };
