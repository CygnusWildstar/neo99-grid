// ==========================================================
//  mute / unmute — toggle audio output
//
//  Returns an effect that the frontend handles. The actual
//  mute lives in window.NEO99_audio (browser-side state).
// ==========================================================

const muteCmd = {
    name: 'mute',
    description: 'silence keyboard clicks, beeps, and alert tones',
    async run() {
        return {
            lines: [
                { text: '' },
                { text: '  ▸ audio output silenced', color: 'dim' },
                { text: '  ▸ type "unmute" to re-enable', color: 'dim' },
                { text: '' },
            ],
            effect: 'audio_mute',
        };
    },
};

const unmuteCmd = {
    name: 'unmute',
    description: 're-enable audio output',
    async run() {
        return {
            lines: [
                { text: '' },
                { text: '  ▸ audio output online', color: 'green' },
                { text: '' },
            ],
            effect: 'audio_unmute',
        };
    },
};

export { muteCmd as mute, unmuteCmd as unmute };