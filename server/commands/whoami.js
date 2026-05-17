// ==========================================================
//  whoami — operator identity
// ==========================================================

export default {
    name: 'whoami',
    description: 'display operator identity',

    async run() {
        return {
            lines: [
                { text: '' },
                { text: '  OPERATOR : CygnusWildstar', color: 'cyanBright' },
                { text: '  CALLSIGN : Wildstar', color: 'cyan' },
                { text: '  SECTOR   : neo99 // Grid', color: 'cyan' },
                { text: '  ACCESS   : full', color: 'green' },
                { text: '  STATUS   : online', color: 'green' },
                { text: '' },
                { text: '  "End of line."', color: 'dim' },
                { text: '' },
            ],
        };
    },
};