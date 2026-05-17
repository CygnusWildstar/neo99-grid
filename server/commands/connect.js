// ==========================================================
//  connect — "SSH into" another fleet node
//
//  Usage: connect <node>
//  Examples: connect neo99noc, connect oracle, connect dc01
//
//  Pure lore-flavored output — doesn't actually SSH anywhere.
//  But it knows the real fleet and gives themed responses.
// ==========================================================

const NODES = {
    'neo99fw':     { ip: '172.16.1.1',  role: 'FortiGate 60E firewall',         banner: 'edge security node' },
    'neo99sw':     { ip: '172.16.1.5',  role: 'Layer 2 switch',                 banner: 'fabric switching node' },
    'neo99-ca01':  { ip: '172.16.1.11', role: 'Smallstep step-ca PKI',          banner: 'certificate authority' },
    'neo99-dc01':  { ip: '172.16.1.35', role: 'Samba 4 Active Directory',       banner: 'identity provider' },
    'neo99esxi':   { ip: '172.16.1.25', role: 'VMware ESXi 8.0 hypervisor',     banner: 'hypervisor — handle with care' },
    'neo99mud':    { ip: '172.16.1.40', role: 'Evennia / Thornhollow MUD',      banner: 'thornhollow game server' },
    'neo99kali':   { ip: '172.16.1.50', role: 'Kali Linux red-team workstation',banner: 'offensive security tooling' },
    'neo99noc':    { ip: '172.16.1.60', role: 'NOC + Neo99 Vault password mgr', banner: 'operations command' },
    'neo99bridge': { ip: '172.16.1.65', role: 'Dev workstation (this host)',    banner: 'YOU ARE ALREADY HERE' },
    'neo99nas':    { ip: '172.16.1.70', role: 'Synology DS723+ storage',        banner: 'primary storage cluster' },
    'neo99oracle':  { ip: '172.16.1.75', role: 'Ollama + Open WebUI',                       banner: 'inference engine' },
    'neo99azeroth': { ip: '172.16.1.80', role: 'WoW Wrath of the Lich King private realm',  banner: 'frozen throne online — by your will, my king' },
};

// Accept friendly aliases
const ALIASES = {
    'fw':       'neo99fw',
    'firewall': 'neo99fw',
    'switch':   'neo99sw',
    'sw':       'neo99sw',
    'ca':       'neo99-ca01',
    'ca01':     'neo99-ca01',
    'pki':      'neo99-ca01',
    'dc':       'neo99-dc01',
    'dc01':     'neo99-dc01',
    'ad':       'neo99-dc01',
    'esxi':     'neo99esxi',
    'hyper':    'neo99esxi',
    'mud':      'neo99mud',
    'kali':     'neo99kali',
    'noc':      'neo99noc',
    'vault':    'neo99noc',
    'bridge':   'neo99bridge',
    'dev':      'neo99bridge',
    'nas':      'neo99nas',
    'storage':  'neo99nas',
    'oracle':   'neo99oracle',
    'ai':       'neo99oracle',
    'ollama':   'neo99oracle',
    'azeroth':  'neo99azeroth',
    'wow':      'neo99azeroth',
    'wotlk':    'neo99azeroth',
    'lich':     'neo99azeroth',
};

export default {
    name: 'connect',
    description: 'connect to a fleet node (usage: connect <node>)',

    async run({ args }) {
        const lines = [{ text: '' }];

        if (!args || args.length === 0) {
            lines.push({ text: '  usage: connect <node>', color: 'dim' });
            lines.push({ text: '  available nodes:', color: 'cyanBright' });
            lines.push({ text: '' });
            for (const [host, info] of Object.entries(NODES)) {
                lines.push({ text: `    ${host.padEnd(14)} ${info.ip.padEnd(14)} ${info.role}`, color: 'cyan' });
            }
            lines.push({ text: '' });
            return { lines };
        }

        const arg = args[0].toLowerCase();
        const hostname = ALIASES[arg] || arg;
        const node = NODES[hostname];

        if (!node) {
            lines.push({ text: `  unknown node: ${arg}`, color: 'red' });
            lines.push({ text: '  type "connect" with no args to list nodes', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        lines.push({ text: `  ▸ establishing connection to ${hostname}...`, color: 'cyan' });
        lines.push({ text: `  ▸ ${node.ip}  ·  ssh handshake...`, color: 'cyan' });
        lines.push({ text: `  ▸ identity disc verified.`, color: 'green' });
        lines.push({ text: '' });
        lines.push({ text: '  ╔══════════════════════════════════════════════════╗', color: 'cyanBright' });
        lines.push({ text: `  ║  ${hostname.toUpperCase().padEnd(46)} ║`, color: 'cyanBright' });
        lines.push({ text: `  ║  ${node.role.padEnd(46)} ║`, color: 'cyan' });
        lines.push({ text: '  ╚══════════════════════════════════════════════════╝', color: 'cyanBright' });
        lines.push({ text: '' });
        lines.push({ text: `  ${node.banner}`, color: 'green' });

        if (hostname === 'neo99bridge') {
            lines.push({ text: '' });
            lines.push({ text: '  hint: you cannot escape from your own bridge.', color: 'dim' });
        }

        lines.push({ text: '' });
        lines.push({ text: '  (note: this is a flavor command — actual SSH is via your shell)', color: 'dim' });
        lines.push({ text: '' });

        return { lines };
    },
};