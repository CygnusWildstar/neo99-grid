// ==========================================================
//  help — list all available commands
// ==========================================================

import { commands } from './index.js';

export default {
    name: 'help',
    description: 'show this message',

    async run() {
        const lines = [
            { text: '' },
            { text: '  Available commands:', color: 'cyanBright' },
            { text: '' },
        ];

        // Build a deduplicated list (aliases point at the same module)
        const seen = new Set();
        const rows = [];
        for (const [name, mod] of commands.entries()) {
            if (seen.has(mod)) continue;
            seen.add(mod);
            rows.push({ name, description: mod.description || '' });
        }

        // Find longest name for alignment
        const w = Math.max(...rows.map(r => r.name.length));

        for (const r of rows) {
            lines.push({
                text: `    ${r.name.padEnd(w + 4)} — ${r.description}`,
                color: 'cyan',
                highlight: { range: [4, 4 + r.name.length], color: 'greenBright' },
            });
        }

        lines.push({ text: '' });
        lines.push({ text: '  Hint: arrow keys for history. Some commands take args (e.g. echo).', color: 'dim' });
        lines.push({ text: '' });

        return { lines };
    },
};