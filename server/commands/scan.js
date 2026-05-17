// ==========================================================
//  scan — fake "network scan" sequence
// ==========================================================

export default {
    name: 'scan',
    description: 'scan local sector for active nodes',

    async run() {
        // We send the full sequence as lines with a "delay" hint
        // for the frontend to render with timing.
        return {
            animated: true,
            lines: [
                { text: '' },
                { text: '  initiating sector scan...', color: 'cyan', delay: 0 },
                { text: '  ▸ sweeping 172.16.1.0/24', color: 'cyan', delay: 350 },
                { text: '    [▓░░░░░░░░░] 10%', color: 'dim', delay: 600 },
                { text: '    [▓▓▓░░░░░░░] 30%', color: 'dim', delay: 900 },
                { text: '    [▓▓▓▓▓▓░░░░] 60%', color: 'dim', delay: 1200 },
                { text: '    [▓▓▓▓▓▓▓▓▓▓] 100%', color: 'green', delay: 1500 },
                { text: '', delay: 1600 },
                { text: '  ▸ nodes detected:', color: 'cyanBright', delay: 1700 },
                { text: '    172.16.1.1   ─ neo99fw (FortiGate 60E)', color: 'cyan', delay: 1850 },
                { text: '    172.16.1.5   ─ neo99sw (switch)', color: 'cyan', delay: 1950 },
                { text: '    172.16.1.25  ─ neo99esxi (hypervisor)', color: 'cyan', delay: 2050 },
                { text: '    172.16.1.35  ─ neo99-dc01 (samba AD)', color: 'cyan', delay: 2150 },
                { text: '    172.16.1.40  ─ neo99mud (evennia)', color: 'cyan', delay: 2250 },
                { text: '    172.16.1.60  ─ neo99noc (linux mint)', color: 'cyan', delay: 2350 },
                { text: '    172.16.1.65  ─ neo99bridge (dev vm) ◄ you are here', color: 'greenBright', delay: 2450 },
                { text: '    172.16.1.70  ─ neo99NAS (synology)', color: 'cyan', delay: 2550 },
                { text: '    172.16.1.75  ─ neo99Oracle (ollama)', color: 'cyan', delay: 2650 },
                { text: '', delay: 2750 },
                { text: '  scan complete. 9 nodes online.', color: 'green', delay: 2850 },
                { text: '' },
            ],
        };
    },
};