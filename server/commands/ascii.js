// ==========================================================
//  ascii — big ASCII art banner from arbitrary text
//
//  Usage: ascii <text>
//  Example: ascii NEO99
// ==========================================================

import figlet from 'figlet';
import { promisify } from 'util';

const figletAsync = promisify(figlet);

export default {
    name: 'ascii',
    description: 'render text as ASCII art banner (usage: ascii <text>)',

    async run({ args }) {
        const lines = [{ text: '' }];

        if (!args || args.length === 0) {
            lines.push({ text: '  usage: ascii <text>', color: 'dim' });
            lines.push({ text: '  example: ascii NEO99', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        const text = args.join(' ');
        if (text.length > 20) {
            lines.push({ text: '  text too long (max 20 chars).', color: 'red' });
            lines.push({ text: '' });
            return { lines };
        }

        try {
            const art = await figletAsync(text, {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default',
            });
            for (const line of art.split('\n')) {
                lines.push({ text: '  ' + line, color: 'cyanBright' });
            }
            lines.push({ text: '' });
            return { lines };
        } catch (err) {
            lines.push({ text: `  figlet error: ${err.message}`, color: 'red' });
            lines.push({ text: '' });
            return { lines };
        }
    },
};