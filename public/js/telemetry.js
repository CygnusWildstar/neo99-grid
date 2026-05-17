// ==========================================================
//  NEO99 :: GRID — HUD telemetry sync
//
//  Polls /api/telemetry and updates the bottom status bar
//  with real server metrics. Polls every 10 seconds.
// ==========================================================

(function () {
    'use strict';

    const POLL_MS = 10 * 1000;

    const $status   = document.getElementById('hud-status');
    const $uptime   = document.getElementById('uptime');
    const $visitors = document.getElementById('visitors');
    const $heap     = document.getElementById('hud-heap');

    function formatUptime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    }

    function setOffline() {
        if ($status) $status.textContent = 'offline';
    }

    async function poll() {
        try {
            const res = await fetch('/api/telemetry', { cache: 'no-store' });
            if (!res.ok) { setOffline(); return; }
            const data = await res.json();

            if ($status)   $status.textContent   = data.status || 'online';
            if ($uptime)   $uptime.textContent   = formatUptime(data.uptimeMs || 0);
            if ($visitors) $visitors.textContent = String(data.visitors ?? '--');
            if ($heap)     $heap.textContent     = `${data.memory?.heapUsedMB ?? '--'} MB`;
        } catch (err) {
            setOffline();
        }
    }

    poll();
    setInterval(poll, POLL_MS);
})();