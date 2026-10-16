// ==========================================================
//  version — build / version info
// ==========================================================

export default {
    name: 'version',
    description: 'show version information',

        async run() {
        const onAzure = !!process.env.WEBSITE_SITE_NAME;
        const sha = (process.env.GIT_COMMIT_SHA || 'local').substring(0, 7);

        return {
            lines: [
                { text: '' },
                { text: '  NEO99 :: GRID', color: 'cyanBright' },
                { text: '  Version       : 0.3.0', color: 'cyan' },
                { text: `  Build         : ${onAzure ? 'production' : 'development'} (${sha})`, color: 'cyan' },
                { text: '  Backend       : Node.js / Express', color: 'cyan' },
                { text: '  Frontend      : xterm.js + vanilla', color: 'cyan' },
                { text: `  Hosting       : ${onAzure ? 'Azure App Service' : 'neo99bridge (local)'}`, color: 'cyan' },
                { text: '' },
                { text: '  Built by CygnusWildstar // 2026', color: 'dim' },
                { text: '' },
            ],
        };
    },
};