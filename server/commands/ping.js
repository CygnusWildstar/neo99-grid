// ==========================================================
//  ping — DNS resolution + TCP reachability check
//
//  Usage: ping <hostname> [port]
//  Examples: ping google.com, ping neo99noc, ping 1.1.1.1 53
//
//  This is a REAL network operation — actually resolves DNS
//  and attempts a TCP connect to verify reachability.
// ==========================================================

import dns from 'dns/promises';
import net from 'net';

const DEFAULT_PORT = 80;
const CONNECT_TIMEOUT_MS = 3000;

function tcpProbe(host, port) {
    return new Promise((resolve) => {
        const start = Date.now();
        const sock = new net.Socket();
        let done = false;

        const finish = (ok, err) => {
            if (done) return;
            done = true;
            sock.destroy();
            resolve({ ok, ms: Date.now() - start, err });
        };

        sock.setTimeout(CONNECT_TIMEOUT_MS);
        sock.once('connect',  () => finish(true));
        sock.once('timeout',  () => finish(false, 'timeout'));
        sock.once('error',    (e) => finish(false, e.code || e.message));
        sock.connect(port, host);
    });
}

export default {
    name: 'ping',
    description: 'resolve DNS + probe TCP reachability (usage: ping <host> [port])',

    async run({ args }) {
        const lines = [{ text: '' }];

        if (!args || args.length === 0) {
            lines.push({ text: '  usage: ping <hostname> [port]', color: 'dim' });
            lines.push({ text: '  examples: ping google.com, ping 1.1.1.1 53', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        const host = args[0];
        const port = parseInt(args[1], 10) || DEFAULT_PORT;

        lines.push({ text: `  ▸ resolving ${host}...`, color: 'cyan' });

        // ---- DNS lookup ----
        let addresses;
        try {
            addresses = await dns.lookup(host, { all: true });
        } catch (err) {
            lines.push({ text: `  ✗ DNS lookup failed: ${err.code || err.message}`, color: 'red' });
            lines.push({ text: '' });
            return { lines };
        }

        for (const a of addresses) {
            lines.push({ text: `    ${a.address} (IPv${a.family})`, color: 'green' });
        }

        // ---- TCP probe ----
        lines.push({ text: `  ▸ probing TCP ${host}:${port}...`, color: 'cyan' });
        const probe = await tcpProbe(host, port);
        if (probe.ok) {
            lines.push({ text: `  ✓ connected in ${probe.ms} ms`, color: 'green' });
        } else {
            lines.push({ text: `  ✗ unreachable: ${probe.err} (${probe.ms} ms)`, color: 'red' });
        }

        lines.push({ text: '' });
        return { lines };
    },
};