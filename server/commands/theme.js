// ==========================================================
//  theme — swap UI color palette
//
//  Usage: theme <name>
//  Themes: tron (default), matrix, amber, magenta
//
//  Backend just returns the theme name; the actual CSS swap
//  happens in the browser via the 'effect' channel.
// ==========================================================

const THEMES = {
    tron:    { label: 'TRON Legacy',         description: 'cyan on near-black (default)' },
    matrix:  { label: 'The Matrix',          description: 'phosphor green on black' },
    amber:   { label: 'Blade Runner 2049',   description: 'amber + cyan, warm dystopia' },
    magenta: { label: 'Ghost in the Shell',  description: 'magenta + cyan, anime cyber' },
};

export default {
    name: 'theme',
    description: 'switch UI palette (usage: theme <name>)',

    async run({ args }) {
        const lines = [{ text: '' }];

        if (!args || args.length === 0) {
            lines.push({ text: '  available themes:', color: 'cyanBright' });
            lines.push({ text: '' });
            for (const [id, t] of Object.entries(THEMES)) {
                lines.push({ text: `    ${id.padEnd(10)} — ${t.label.padEnd(22)} ${t.description}`, color: 'cyan' });
            }
            lines.push({ text: '' });
            lines.push({ text: '  usage: theme <name>   e.g.  theme matrix', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        const name = args[0].toLowerCase();
        const theme = THEMES[name];

        if (!theme) {
            lines.push({ text: `  unknown theme: ${name}`, color: 'red' });
            lines.push({ text: '  type "theme" with no args to list available themes', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        lines.push({ text: `  ▸ applying theme: ${theme.label}`, color: 'cyan' });
        lines.push({ text: '' });

        return {
            lines,
            effect: 'theme',
            effectData: { name },
        };
    },
};