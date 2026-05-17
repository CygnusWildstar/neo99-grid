// ==========================================================
//  version — build / version info
// ==========================================================

export default {
    name: 'version',
    description: 'show version information',

    async run() {
        return {
            lines: [
                { text: '' },
                { text: '  NEO99 :: GRID', color: 'cyanBright' },
                { text: '  Version       : 0.3.0', color: 'cyan' },
                { text: '  Build         : development', color: 'cyan' },
                { text: '  Backend       : Node.js / Express', color: 'cyan' },
                { text: '  Frontend      : xterm.js + vanilla', color: 'cyan' },
                { text: '  Hosting       : neo99bridge (pre-Azure)', color: 'cyan' },
                { text: '' },
                { text: '  Built by CygnusWildstar // 2026', color: 'dim' },
                { text: '' },
            ],
        };
    },
};