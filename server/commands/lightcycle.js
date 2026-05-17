// ==========================================================
//  lightcycle — control the ASCII lightcycle arena
//
//  Usage: lightcycle [reset|pause|resume|score]
//  Default (no args): show status and command list
// ==========================================================

export default {
    name: 'lightcycle',
    description: 'control the lightcycle arena (try: lightcycle reset)',

    async run({ args }) {
        const lines = [{ text: '' }];
        const sub = args && args[0] ? args[0].toLowerCase() : null;

        if (!sub) {
            lines.push({ text: '  ▸ Lightcycle Arena Control', color: 'cyanBright' });
            lines.push({ text: '' });
            lines.push({ text: '  usage: lightcycle <subcommand>', color: 'dim' });
            lines.push({ text: '' });
            lines.push({ text: '  subcommands:', color: 'cyan' });
            lines.push({ text: '    reset        clear arena and start a new round', color: 'cyan' });
            lines.push({ text: '    pause        pause game (also pauses when terminal has focus)', color: 'cyan' });
            lines.push({ text: '    resume       resume game (must have arena focused)', color: 'cyan' });
            lines.push({ text: '    score        show current score', color: 'cyan' });
            lines.push({ text: '    resetscore   reset score to 0-0', color: 'cyan' });
            lines.push({ text: '' });
            lines.push({ text: '  tip: click the arena strip to focus, arrow keys to steer, esc to release.', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        // All subcommands operate via the frontend (effect channel)
        switch (sub) {
            case 'reset':
                lines.push({ text: '  ▸ resetting arena...', color: 'cyan' });
                lines.push({ text: '' });
                return { lines, effect: 'lightcycle_reset' };

            case 'pause':
                lines.push({ text: '  ▸ arena paused', color: 'dim' });
                lines.push({ text: '' });
                return { lines, effect: 'lightcycle_pause' };

            case 'resume':
                lines.push({ text: '  ▸ resume requested (note: arena must be focused)', color: 'dim' });
                lines.push({ text: '' });
                return { lines, effect: 'lightcycle_resume' };

            case 'score':
                lines.push({ text: '  ▸ requesting score from browser...', color: 'cyan' });
                lines.push({ text: '' });
                return { lines, effect: 'lightcycle_score' };

            case 'resetscore':
                lines.push({ text: '  ▸ score reset to 0 — 0', color: 'cyan' });
                lines.push({ text: '' });
                return { lines, effect: 'lightcycle_reset_score' };

            default:
                lines.push({ text: `  unknown subcommand: ${sub}`, color: 'red' });
                lines.push({ text: '  try: lightcycle (no args) to see options', color: 'dim' });
                lines.push({ text: '' });
                return { lines };
        }
    },
};