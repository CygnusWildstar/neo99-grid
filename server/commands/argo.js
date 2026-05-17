// ==========================================================
//  argo / wildstar — Star Blazers / Space Battleship Yamato
//
//  Hidden easter egg honoring the source of the CygnusWildstar
//  callsign. Derek Wildstar at the helm of the Argo.
// ==========================================================

export default {
    name: 'argo',
    description: 'classified',

    async run() {
        return {
            lines: [
                { text: '' },
                { text: '  ╔═════════════════════════════════════════════╗', color: 'yellow' },
                { text: '  ║       STAR FORCE — TRANSMISSION OPEN        ║', color: 'yellow' },
                { text: '  ╚═════════════════════════════════════════════╝', color: 'yellow' },
                { text: '' },
                { text: '  Captain Avatar:', color: 'cyanBright' },
                { text: '    "Wildstar... the wave motion gun is fully charged."', color: 'cyan' },
                { text: '    "We have one shot. Make it count."', color: 'cyan' },
                { text: '' },
                { text: '  Derek Wildstar:', color: 'cyanBright' },
                { text: '    "All hands, brace for fire. Forward batteries... LOCK."', color: 'cyan' },
                { text: '    "Wave motion gun — FIRE!"', color: 'greenBright' },
                { text: '' },
                { text: '                    ╱╲', color: 'yellow' },
                { text: '                   ╱  ╲', color: 'yellow' },
                { text: '              ════╱════╲════', color: 'cyanBright' },
                { text: '              YAMATO / ARGO', color: 'cyanBright' },
                { text: '              ═══════════════', color: 'cyanBright' },
                { text: '' },
                { text: '  Bound for Iscandar. End of transmission.', color: 'dim' },
                { text: '' },
            ],
        };
    },
};