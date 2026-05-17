// ==========================================================
//  NEO99 :: GRID — Clock + Uptime
//  Updates the bottom status bar in real time
// ==========================================================

(function () {
    'use strict';

    const $clock   = document.getElementById('clock');
    const $uptime  = document.getElementById('uptime');
    const startedAt = Date.now();

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function tick() {
        const now = new Date();

        // Clock — HH:MM:SS UTC
        if ($clock) {
            $clock.textContent =
                pad2(now.getUTCHours()) + ':' +
                pad2(now.getUTCMinutes()) + ':' +
                pad2(now.getUTCSeconds()) + ' UTC';
        }

        // Uptime — Xd Xh Xm since page load
        if ($uptime) {
            const elapsedMs = Date.now() - startedAt;
            const elapsedMin = Math.floor(elapsedMs / 60000);
            const days  = Math.floor(elapsedMin / 1440);
            const hours = Math.floor((elapsedMin % 1440) / 60);
            const mins  = elapsedMin % 60;
            $uptime.textContent = `${days}d ${hours}h ${mins}m`;
        }
    }

    // First tick immediately, then every second
    tick();
    setInterval(tick, 1000);
})();