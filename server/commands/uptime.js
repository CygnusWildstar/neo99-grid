// ==========================================================
//  uptime — server uptime in human form
// ==========================================================

const BOOT = Date.now();

export default {
    name: 'uptime',
    description: 'show server uptime',

    async run() {
        const ms = Date.now() - BOOT;
        const totalSec = Math.floor(ms / 1000);
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;

        return {
            lines: [
                { text: '' },
                { text: `  Grid uptime: ${d}d ${h}h ${m}m ${s}s`, color: 'green' },
                { text: `  Online since: ${new Date(BOOT).toISOString()}`, color: 'dim' },
                { text: '' },
            ],
        };
    },
};