// ==========================================================
//  NEO99 :: GRID — Theme switcher
//
//  Listens for theme-change events from the console (when
//  the 'theme' command is run) and swaps CSS variables on
//  :root in real time. No reload needed.
// ==========================================================

(function () {
    'use strict';

    const THEMES = {
        tron: {
            '--cyan':        '#00ffff',
            '--cyan-bright': '#4dffff',
            '--cyan-dim':    '#008888',
            '--cyan-deep':   '#003333',
            '--green':       '#00ff99',
            '--bg-base':     '#000308',
            '--bg-panel':    '#02090f',
            '--bg-panel-hi': '#061218',
        },
        matrix: {
            '--cyan':        '#00ff41',
            '--cyan-bright': '#66ff85',
            '--cyan-dim':    '#008822',
            '--cyan-deep':   '#003311',
            '--green':       '#00ff41',
            '--bg-base':     '#000800',
            '--bg-panel':    '#020c02',
            '--bg-panel-hi': '#061806',
        },
        amber: {
            '--cyan':        '#ffaa00',
            '--cyan-bright': '#ffcc44',
            '--cyan-dim':    '#996600',
            '--cyan-deep':   '#332200',
            '--green':       '#00ddcc',
            '--bg-base':     '#0a0500',
            '--bg-panel':    '#140a00',
            '--bg-panel-hi': '#1f1000',
        },
        magenta: {
            '--cyan':        '#ff00ff',
            '--cyan-bright': '#ff66ff',
            '--cyan-dim':    '#880088',
            '--cyan-deep':   '#330033',
            '--green':       '#00ffff',
            '--bg-base':     '#08000a',
            '--bg-panel':    '#0f0214',
            '--bg-panel-hi': '#180620',
        },
    };

    function applyTheme(name) {
        const t = THEMES[name];
        if (!t) return;
        const root = document.documentElement;
        for (const [varName, value] of Object.entries(t)) {
            root.style.setProperty(varName, value);
        }
    }

    // Expose globally so console.js can call it
    window.NEO99_applyTheme = applyTheme;
})();