// ==========================================================
//  help — list all available commands
//
//  Laid out for the docked ~50-column terminal:
//  descriptions word-wrap under their own column, and any
//  "(usage: ...)" / "(try: ...)" hint gets its own dim line.
// ==========================================================

import { commands } from './index.js';

const MAX_WIDTH = 48;   // safe line length for the docked terminal
const INDENT = 2;       // spaces before each command name

// Split "do a thing (usage: x <y>)" into description + usage hint
function splitUsage(text) {
    const m = text.match(/^(.*?)\s*\((usage|try):\s*(.+)\)$/);
    if (!m) return { desc: text, usage: null };
    return { desc: m[1], usage: `${m[2]}: ${m[3]}` };
}

// Word-wrap text to a column width
function wrap(text, width) {
    const lines = [];
    let line = '';
    for (const word of text.split(' ')) {
        if (line && (line + ' ' + word).length > width) {
            lines.push(line);
            line = word;
        } else {
            line = line ? line + ' ' + word : word;
        }
    }
    if (line) lines.push(line);
    return lines;
}

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

        // Column where descriptions start
        const nameWidth = Math.max(...rows.map(r => r.name.length));
        const descCol = INDENT + nameWidth + 2;
        const descWidth = MAX_WIDTH - descCol;
        const pad = ' '.repeat(descCol);

        for (const r of rows) {
            const { desc, usage } = splitUsage(r.description);
            const [first, ...rest] = wrap(desc, descWidth);

            lines.push({
                text: ' '.repeat(INDENT) + r.name.padEnd(nameWidth + 2) + (first || ''),
                color: 'cyan',
                highlight: { range: [INDENT, INDENT + r.name.length], color: 'greenBright' },
            });
            for (const cont of rest) {
                lines.push({ text: pad + cont, color: 'cyan' });
            }
            if (usage) {
                for (const u of wrap(usage, descWidth)) {
                    lines.push({ text: pad + u, color: 'dim' });
                }
            }
        }

        lines.push({ text: '' });
        lines.push({ text: '  Hint: arrow keys recall history.', color: 'dim' });
        lines.push({ text: '' });

        return { lines };
    },
};