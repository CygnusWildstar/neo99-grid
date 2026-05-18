// ==========================================================
//  NEO99 :: GRID — Network Activity Visualizer
//
//  Polls /api/netviz on a fast cadence (~1.2s) and renders each
//  recent HTTP request as an animated row in the netviz panel.
//  Shows top routes by hit count and global stats at the bottom.
// ==========================================================

(function () {
    'use strict';

    const $pane = document.querySelector('.netviz-pane');
    if (!$pane) {
        console.warn('[netviz] .netviz-pane not found');
        return;
    }

    const POLL_MS  = 1200;             // poll cadence
    const MAX_ROWS = 8;                // visible row cap
    const seen = new Set();            // dedupe rendered events across polls

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildShell() {
        $pane.innerHTML = `
            <div class="netviz-header">
                <span class="netviz-title">// NETWORK ACTIVITY</span>
                <span class="netviz-badge">[ live ]</span>
            </div>
            <div class="netviz-canvas" id="netviz-canvas"></div>
            <div class="netviz-stats" id="netviz-stats">
                <span class="stat">connecting...</span>
            </div>
        `;
    }

    function addRow(canvas, ev) {
        const cls = ev.status >= 400 ? 'netviz-row status-err' : 'netviz-row';
        const row = document.createElement('div');
        row.className = cls;
        row.innerHTML = `
            <span class="netviz-packet"></span>
            <span class="netviz-method">${escapeHtml(ev.method)}</span>
            <span class="netviz-path">${escapeHtml(ev.path)}</span>
            <span class="netviz-status">${ev.status || '???'}</span>
        `;
        canvas.appendChild(row);

        // Cap visible rows; fade out the oldest then remove
        while (canvas.children.length > MAX_ROWS) {
            const first = canvas.firstElementChild;
            first.classList.add('fading');
            setTimeout(() => first.remove(), 600);
            // Break after marking one so we drop them one per poll
            break;
        }
    }

    function renderStats(stats, snap) {
        const topRoute = snap.topRoutes[0]
            ? `${snap.topRoutes[0].path} (${snap.topRoutes[0].count})`
            : 'none';
        stats.innerHTML = `
            <span class="stat"><strong>${snap.reqsInWindow}</strong> reqs/30s</span>
            <span class="stat"><strong>${snap.totalSinceBoot}</strong> total</span>
            <span class="stat"><strong>${snap.errorsSinceBoot}</strong> err</span>
            <span class="stat">top: <strong>${escapeHtml(topRoute)}</strong></span>
        `;
    }

    async function poll() {
        const canvas = document.getElementById('netviz-canvas');
        const stats  = document.getElementById('netviz-stats');
        if (!canvas || !stats) return;

        try {
            const res = await fetch('/api/netviz');
            if (!res.ok) return;
            const snap = await res.json();

            // Only render events we haven't seen yet (dedupe by ts+path)
            for (const ev of snap.recent) {
                const key = `${ev.ts}|${ev.method}|${ev.path}|${ev.status}`;
                if (seen.has(key)) continue;
                seen.add(key);
                addRow(canvas, ev);
            }
            // Trim seen set so it doesn't grow unbounded
            if (seen.size > 500) {
                seen.clear();
            }

            renderStats(stats, snap);
        } catch (err) {
            console.warn('[netviz] poll failed:', err);
        }
    }

    // ---- Boot ----
    buildShell();
    poll();
    setInterval(poll, POLL_MS);
})();
