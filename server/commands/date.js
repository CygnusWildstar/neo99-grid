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
                { text: `  Local    : ${now.toString()}`, color: 'cyan' },
                { text: '' },
            ],
        };
    },
};