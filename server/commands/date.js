// ==========================================================
//  date — server time, in multiple formats
// ==========================================================

export default {
    name: 'date',
    description: 'show current server date and time',

    async run() {
        const now = new Date();
        return {
            lines: [
                { text: '' },
                { text: `  UTC      : ${now.toUTCString()}`, color: 'cyan' },
                { text: `  ISO      : ${now.toISOString()}`, color: 'cyan' },
                { text: `  Epoch    : ${Math.floor(now.getTime() / 1000)}`, color: 'cyan' },
                { text: `  Server   : ${now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })}`, color: 'cyan' },
                { text: '' },
            ],
        };
    },
};