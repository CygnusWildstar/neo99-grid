// ==========================================================
//  NEO99 :: GRID — Command Registry
// ==========================================================

import help from './help.js';
import whoami from './whoami.js';
import dateCmd from './date.js';
import uptime from './uptime.js';
import statusCmd from './status.js';
import echo from './echo.js';
import scan from './scan.js';
import matrix from './matrix.js';
import argo from './argo.js';
import version from './version.js';
import feeds from './feeds.js';
import weather from './weather.js';
import connect from './connect.js';
import ascii from './ascii.js';
import motd from './motd.js';
import ping from './ping.js';
import theme from './theme.js';
import { mute, unmute } from './mute.js';
import lightcycle from './lightcycle.js';

export const commands = new Map([
    ['help',     help],
    ['whoami',   whoami],
    ['date',     dateCmd],
    ['uptime',   uptime],
    ['status',   statusCmd],
    ['echo',     echo],
    ['scan',     scan],
    ['matrix',   matrix],
    ['argo',     argo],
    ['wildstar', argo],
    ['version',  version],
    ['feeds',    feeds],
    ['weather',  weather],
    ['connect',  connect],
    ['ascii',    ascii],
    ['motd',     motd],
    ['ping',     ping],
    ['theme',      theme],
    ['mute',       mute],
    ['unmute',     unmute],
    ['lightcycle', lightcycle],
]);

export async function runCommand(name, args, context) {
    const cmd = commands.get(name.toLowerCase());
    if (!cmd) {
        return {
            ok: false,
            lines: [
                { text: `unknown command: ${name}`, color: 'red' },
                { text: 'type "help" for a list of available commands.', color: 'dim' },
            ],
        };
    }

    try {
        const result = await cmd.run({ args, context });
        return { ok: true, ...result };
    } catch (err) {
        console.error(`[command:${name}] error:`, err);
        return {
            ok: false,
            lines: [
                { text: `error executing ${name}: ${err.message}`, color: 'red' },
            ],
        };
    }
}