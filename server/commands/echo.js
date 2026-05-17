// ==========================================================
//  echo — echo input back to the operator
// ==========================================================

export default {
    name: 'echo',
    description: 'echo input back (usage: echo <text>)',

    async run({ args }) {
        if (!args || args.length === 0) {
            return {
                lines: [
                    { text: '  (nothing to echo — usage: echo <text>)', color: 'dim' },
                ],
            };
        }
        return {
            lines: [
                { text: `  ${args.join(' ')}`, color: 'cyan' },
            ],
        };
    },
};