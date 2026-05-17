// ==========================================================
//  status — comprehensive system status
// ==========================================================

import { commands } from './index.js';

const BOOT = Date.now();

export default {
    name: 'status',
    description: 'show full system status',

    async run() {
        const memUsage = process.memoryUsage();
        const heapMB = (memUsage.heapUsed / 1024 / 1024).toFixed(1);
        const rssMB  = (memUsage.rss / 1024 / 1024).toFixed(1);
        const uptimeMin = Math.floor((Date.now() - BOOT) / 60000);

        return {
            lines: [
                { text: '' },
                { text: '  ╔═══ SYSTEM STATUS ═══════════════════════════╗', color: 'cyanBright' },
                { text: '  ║                                             ║', color: 'cyanBright' },
                { text: `  ║  Grid Name   : neo99 // Grid`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  Operator    : CygnusWildstar`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  Version     : 0.3.0`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  Node.js     : ${process.version}`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  Platform    : ${process.platform}`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  Uptime      : ${uptimeMin} min`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  Heap Used   : ${heapMB} MB`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  RSS         : ${rssMB} MB`.padEnd(48) + '║', color: 'cyan' },
                { text: `  ║  Commands    : ${commands.size} registered`.padEnd(48) + '║', color: 'cyan' },
                { text: '  ║                                             ║', color: 'cyanBright' },
                { text: '  ║  Connection  : established                  ║', color: 'green' },
                { text: '  ║  Identity    : verified                     ║', color: 'green' },
                { text: '  ╚═════════════════════════════════════════════╝', color: 'cyanBright' },
                { text: '' },
            ],
        };
    },
};