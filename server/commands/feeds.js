// ==========================================================
//  feeds — list available feed sources or inspect one
//
//  Usage:
//    feeds              → list all sources with item counts
//    feeds <source>     → show latest items from one source
// ==========================================================

import { cache, sources } from '../services/feeds/index.js';

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
                const updated = entry?.updatedAt
                    ? new Date(entry.updatedAt).toISOString()
                    : 'not yet fetched';
                const errStr = entry?.error ? `  ✗ ${entry.error}` : '';

                lines.push({
                    text: `    ${s.id.padEnd(12)} ${String(count).padStart(2)} items   ${updated}${errStr}`,
                    color: entry?.error ? 'red' : (count > 0 ? 'cyan' : 'dim'),
                });
            }
            lines.push({ text: '' });
            lines.push({ text: '  Usage: feeds <source>   (e.g. feeds hackernews)', color: 'dim' });
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
            lines.push({ text: '  initial fetch may still be running. try again in a few seconds.', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        lines.push({ text: `  // ${source.label}`, color: 'cyanBright' });
        lines.push({ text: `  ${entry.items.length} items, updated ${entry.updatedAt}`, color: 'dim' });
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