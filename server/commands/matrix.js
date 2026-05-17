// ==========================================================
//  matrix — trigger a Matrix-rain effect in the frontend
// ==========================================================

export default {
    name: 'matrix',
    description: 'engage the matrix',

    async run() {
        return {
            lines: [
                { text: '' },
                { text: '  Wake up, Operator...', color: 'green' },
                { text: '  The Matrix has you...', color: 'green' },
                { text: '  Follow the white rabbit.', color: 'green' },
                { text: '' },
            ],
            // The frontend watches for this and triggers the effect.
            effect: 'matrix',
        };
    },
};