// ==========================================================
//  NEO99 :: GRID — Command Registry
//
//  Aggregates all individual command modules into a single
//  Map keyed by command name. Adding a new command = create
//  a new file in this directory and register it below.
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

// ---- The registry — name → command module ----
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
    ['wildstar', argo],          // alias — Star Blazers callsign
    ['version',  version],
]);

// ---- Helper to invoke a command safely ----
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