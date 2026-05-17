// ==========================================================
//  NEO99 :: GRID — Clock
//  The status-bar clock. Uptime + visitors + heap come
//  from /js/telemetry.js (synced with the real server).
// ==========================================================

(function () {
    'use strict';

    const $clock = document.getElementById('clock');
    if (!$clock) return;

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function tick() {
        const now = new Date();
        $clock.textContent =
            pad2(now.getUTCHours()) + ':' +
            pad2(now.getUTCMinutes()) + ':' +
            pad2(now.getUTCSeconds()) + ' UTC';
    }

    tick();
    setInterval(tick, 1000);
})();