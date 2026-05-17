// ==========================================================
//  scan — fake "network scan" sequence
// ==========================================================
export default {
    name: 'scan',
    description: 'scan local sector for active nodes',
    async run() {
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
                { text: '    172.16.1.1   ─ neo99fw      (FortiGate 60E firewall)',                color: 'cyan',        delay: 1850 },
                { text: '    172.16.1.5   ─ neo99sw      (layer 2 switch)',                        color: 'cyan',        delay: 1930 },
                { text: '    172.16.1.11  ─ neo99-ca01   (smallstep step-ca PKI)',                 color: 'cyan',        delay: 2010 },
                { text: '    172.16.1.25  ─ neo99esxi    (VMware ESXi 8.0 hypervisor)',            color: 'cyan',        delay: 2090 },
                { text: '    172.16.1.35  ─ neo99-dc01   (samba 4 active directory)',              color: 'cyan',        delay: 2170 },
                { text: '    172.16.1.40  ─ neo99mud     (evennia / thornhollow)',                 color: 'cyan',        delay: 2250 },
                { text: '    172.16.1.50  ─ neo99kali    (red-team workstation)',                  color: 'cyan',        delay: 2330 },
                { text: '    172.16.1.60  ─ neo99noc     (linux mint, vault)',                     color: 'cyan',        delay: 2410 },
                { text: '    172.16.1.65  ─ neo99bridge  (dev VM) ◄ you are here',                 color: 'greenBright', delay: 2490 },
                { text: '    172.16.1.70  ─ neo99NAS     (synology DS723+)',                       color: 'cyan',        delay: 2570 },
                { text: '    172.16.1.75  ─ neo99Oracle  (ollama + open webui)',                   color: 'cyan',        delay: 2650 },
                { text: '    172.16.1.80  ─ neo99Azeroth (WotLK private realm)',                   color: 'cyan',        delay: 2730 },
                { text: '', delay: 2830 },
                { text: '  scan complete. 12 nodes online.', color: 'green', delay: 2930 },
                { text: '' },
            ],
        };
    },
};
