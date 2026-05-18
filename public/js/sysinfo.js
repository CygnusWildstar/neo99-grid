// ==========================================================
//  NEO99 :: GRID — System Telemetry panel
//
//  Fetches /api/sysinfo once on boot and appends a panel to
//  the feed pane showing deploy metadata, runtime, region.
//  Updates uptime/heap every 10 seconds.
// ==========================================================

(function () {
    'use strict';

    const $pane = document.querySelector('.feed-pane');
    if (!$pane) {
        console.warn('[sysinfo] .feed-pane not found');
        return;
    }

    const REFRESH_MS = 10 * 1000;  // refresh uptime/heap every 10s
    let staticInfo = null;          // cached after first fetch

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatUptime(seconds) {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    }

    function formatDeployTime(iso) {
        if (!iso) return 'local dev';
        try {
            const d = new Date(iso);
            return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        } catch {
            return iso;
        }
    }

    function render(info) {
        // Remove any existing sysinfo card first
        const existing = $pane.querySelector('.sysinfo-card');
        if (existing) existing.remove();

        const commitLink = info.commit === 'local'
            ? '<span style="color: var(--cyan-dim);">local</span>'
            : `<a href="${escapeHtml(info.repoUrl)}/commit/${escapeHtml(info.commitFull)}" target="_blank" rel="noopener" style="color: var(--cyan); text-decoration: underline;">${escapeHtml(info.commit)}</a>`;

        const card = document.createElement('article');
        card.className = 'feed-card sysinfo-card';
        card.innerHTML = `
            <header class="card-header">
                <span class="source">// SYSTEM TELEMETRY</span>
                <span class="count">[ live ]</span>
            </header>
            <div class="card-body sysinfo-body">
                <div class="sysinfo-row"><span class="sysinfo-key">REGION</span><span class="sysinfo-val">${escapeHtml(info.region)}</span></div>
                <div class="sysinfo-row"><span class="sysinfo-key">RUNTIME</span><span class="sysinfo-val">${escapeHtml(info.runtime)}</span></div>
                <div class="sysinfo-row"><span class="sysinfo-key">HOST</span><span class="sysinfo-val">${escapeHtml(info.host)}</span></div>
                <div class="sysinfo-row"><span class="sysinfo-key">BOOT TIME</span><span class="sysinfo-val">${formatDeployTime(info.bootTime)}</span></div>
                <div class="sysinfo-row"><span class="sysinfo-key">UPTIME</span><span class="sysinfo-val">${formatUptime(info.uptime)}</span></div>
                <div class="sysinfo-row"><span class="sysinfo-key">HEAP</span><span class="sysinfo-val">${escapeHtml(info.heapMB)} MB</span></div>
                <div class="sysinfo-row"><span class="sysinfo-key">COMMIT</span><span class="sysinfo-val">${commitLink}</span></div>
                <div class="sysinfo-row"><span class="sysinfo-key">DEPLOY</span><span class="sysinfo-val">${formatDeployTime(info.deployTime)}</span></div>
            </div>
        `;
        $pane.appendChild(card);
    }

    async function fetchAndRender() {
        try {
            const res = await fetch('/api/sysinfo');
            if (!res.ok) return;
            const data = await res.json();
            staticInfo = data;  // cache for later refreshes
            render(data);
        } catch (err) {
            console.warn('[sysinfo] fetch failed:', err);
        }
    }

    // ---- Boot ----
    // Wait a beat so feeds.js renders its cards first, then append ours.
    setTimeout(fetchAndRender, 500);
    setInterval(fetchAndRender, REFRESH_MS);
})();
