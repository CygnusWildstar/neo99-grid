// ==========================================================
//  motd — Message of the Day
//
//  Random sci-fi / hacker / operator-themed quotes. Pure fun.
// ==========================================================

const QUOTES = [
    { text: '"End of line."',                                                       attribution: 'Master Control Program — TRON' },
    { text: '"I tried to picture clusters of information as they moved through the computer."', attribution: 'Kevin Flynn — TRON Legacy' },
    { text: '"Greetings, programs."',                                               attribution: 'TRON' },
    { text: '"The Grid... a digital frontier. I tried to picture clusters of information..."', attribution: 'Kevin Flynn — TRON Legacy' },
    { text: '"Wake up, Neo... the Matrix has you."',                                attribution: 'The Matrix' },
    { text: '"There is no spoon."',                                                 attribution: 'The Matrix' },
    { text: '"I know kung fu."',                                                    attribution: 'Neo — The Matrix' },
    { text: '"Wave motion gun — FIRE!"',                                            attribution: 'Derek Wildstar — Star Blazers' },
    { text: '"All hands, brace for shock."',                                        attribution: 'Captain Avatar — Star Blazers' },
    { text: '"The net is vast and infinite."',                                      attribution: 'Major Motoko Kusanagi — Ghost in the Shell' },
    { text: '"It is by will alone I set my mind in motion."',                       attribution: 'Mentat Litany — Dune' },
    { text: '"Hello, world."',                                                      attribution: 'every programmer ever' },
    { text: '"Make it so."',                                                        attribution: 'Captain Picard — Star Trek: TNG' },
    { text: '"Resistance is futile."',                                              attribution: 'The Borg — Star Trek' },
    { text: '"Do. Or do not. There is no try."',                                    attribution: 'Yoda — The Empire Strikes Back' },
    { text: '"Move fast and break things."',                                        attribution: 'early Facebook (formerly motto, since softened)' },
    { text: '"It works on my machine."',                                            attribution: 'every developer at 3am' },
    { text: '"It\'s not a bug, it\'s a feature."',                                  attribution: 'PR statement #47' },
    { text: '"Have you tried turning it off and on again?"',                        attribution: 'The IT Crowd' },
    { text: '"There are only two hard things in computer science: cache invalidation and naming things."', attribution: 'Phil Karlton' },
    { text: '"You are not prepared!"',                                              attribution: 'Illidan Stormrage — World of Warcraft' },
    { text: '"Frostmourne hungers."',                                               attribution: 'Arthas Menethil, the Lich King' },
    { text: '"All these moments will be lost in time, like tears in rain."',       attribution: 'Roy Batty — Blade Runner' },
];

export default {
    name: 'motd',
    description: 'message of the day',

    async run() {
        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        return {
            lines: [
                { text: '' },
                { text: '  ╔══ MESSAGE OF THE DAY ══════════════════════════╗', color: 'cyanBright' },
                { text: '  ║                                                ║', color: 'cyanBright' },
                { text: `  ║  ${q.text}`, color: 'cyan' },
                { text: '  ║                                                ║', color: 'cyanBright' },
                { text: `  ║  — ${q.attribution}`, color: 'dim' },
                { text: '  ║                                                ║', color: 'cyanBright' },
                { text: '  ╚════════════════════════════════════════════════╝', color: 'cyanBright' },
                { text: '' },
            ],
        };
    },
};