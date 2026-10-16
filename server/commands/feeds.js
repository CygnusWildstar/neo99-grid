// ==========================================================
//  feeds — list available feed sources or inspect one
//
//  Usage:
//    feeds              → list all sources with item counts
//    feeds <source>     → show latest items from one source
// ==========================================================

import { cache, sources } from '../services/feeds/index.js';

// Turn an ISO timestamp into a short relative age ("12m ago")
function ago(iso) {
    if (!iso) return 'not yet fetched';
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    return `${Math.floor(min / 60)}h ago`;
}

export default {
    name: 'feeds',
    description: 'list feed sources, or show items (usage: feeds [source])',

    async run({ args }) {
        const lines = [];
        lines.push({ text: '' });

        // No args → summary view
        if (!args || args.length === 0) {
            lines.push({ text: '  Feed sources:', color: 'cyanBright' });
            lines.push({ text: '' });
            for (const s of sources) {
                const entry = cache.get(s.id);
                const count = entry?.items?.length || 0;
                const updated = ago(entry?.updatedAt);
                const errStr = entry?.error ? `  ✗ ${entry.error}` : '';

                lines.push({
                    text: `    ${s.id.padEnd(17)}${String(count).padStart(2)} items  ${updated}${errStr}`,
                    color: entry?.error ? 'red' : (count > 0 ? 'cyan' : 'dim'),
                });
            }
            lines.push({ text: '' });
            lines.push({ text: '  Usage: feeds <source>', color: 'dim' });
            lines.push({ text: '  e.g.   feeds hackernews', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        // With arg → drill into one source
        const sourceId = args[0].toLowerCase();
        const source = sources.find(s => s.id === sourceId);
        if (!source) {
            lines.push({ text: `  unknown source: ${sourceId}`, color: 'red' });
            lines.push({ text: '  available: ' + sources.map(s => s.id).join(', '), color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        const entry = cache.get(sourceId);
        if (!entry || !entry.items || entry.items.length === 0) {
            lines.push({ text: `  no items cached for ${source.label} yet.`, color: 'dim' });
            lines.push({ text: '  initial fetch may still be running.', color: 'dim' });
            lines.push({ text: '  try again in a few seconds.', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        lines.push({ text: `  // ${source.label}`, color: 'cyanBright' });
        lines.push({ text: `  ${entry.items.length} items, updated ${ago(entry.updatedAt)}`, color: 'dim' });
        lines.push({ text: '' });

        for (const item of entry.items) {
            lines.push({ text: `  • ${item.title}`, color: 'cyan' });
            if (item.url) {
                lines.push({ text: `    ${item.url}`, color: 'dim' });
            }
            lines.push({ text: '' });
        }

        return { lines };
    },
};