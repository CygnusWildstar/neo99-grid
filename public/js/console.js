// ==========================================================
//  NEO99 :: GRID — Operator Console
//  xterm.js-powered interactive terminal
//  Operator: CygnusWildstar
// ==========================================================
//
// Pass 2 scope: stand up a working terminal with full input
//   handling. Two local commands wired up to prove the loop:
//     help    → prints help text
//     clear   → clears the screen
//   Anything else gets a friendly "unknown command" response.
//
// Pass 3 will route real commands through the Express backend.
// ==========================================================

(function () {
    'use strict';

    // ---- Theme — TRON Legacy cyan, matched to grid.css palette ----
    const NEO99_THEME = {
        background:  '#000308',
        foreground:  '#00ffff',
        cursor:      '#00ffff',
        cursorAccent:'#000308',
        selection:   'rgba(0, 255, 255, 0.3)',

        // ANSI palette — using cyans / greens / minimal warmth
        black:        '#000308',
        red:          '#ff3355',
        green:        '#00ff99',
        yellow:       '#ffaa00',
        blue:         '#0088ff',
        magenta:      '#ff66cc',
        cyan:         '#00ffff',
        white:        '#ccffff',

        brightBlack:  '#1a3a3a',
        brightRed:    '#ff6677',
        brightGreen:  '#66ffbb',
        brightYellow: '#ffcc44',
        brightBlue:   '#44aaff',
        brightMagenta:'#ff99dd',
        brightCyan:   '#4dffff',
        brightWhite:  '#ffffff',
    };

    // ---- ANSI escape helpers — for inline colored output ----
    const ESC = '\x1b[';
    const ansi = {
        reset:        ESC + '0m',
        cyan:         ESC + '36m',
        cyanBright:   ESC + '96m',
        green:        ESC + '32m',
        greenBright:  ESC + '92m',
        red:          ESC + '31m',
        yellow:       ESC + '33m',
        dim:          ESC + '2m',
        bold:         ESC + '1m',
    };

    // ---- Boot ----
    const term = new Terminal({
        theme: NEO99_THEME,
        fontFamily: '"Courier New", "Consolas", "Monaco", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 2000,
        allowProposedApi: true,
        convertEol: true,
    });

    // Addons
    const fitAddon = new FitAddon.FitAddon();
    const webLinksAddon = new WebLinksAddon.WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Mount into the #terminal div in index.html
    term.open(document.getElementById('terminal'));

    // Fit to container dimensions, then refit on any window resize
    fitAddon.fit();
    window.addEventListener('resize', () => fitAddon.fit());

    // ---- Banner ----
    function printBanner() {
        const c = ansi.cyanBright;
        const r = ansi.reset;
        const d = ansi.dim + ansi.cyan;

        term.writeln('');
        term.writeln(c + '  ╔══════════════════════════════════════════════════╗' + r);
        term.writeln(c + '  ║              NEO99 // GRID                       ║' + r);
        term.writeln(c + '  ║          Operator Console v0.2.0                 ║' + r);
        term.writeln(c + '  ╚══════════════════════════════════════════════════╝' + r);
        term.writeln('');
        term.writeln(d + '  [OK] ' + ansi.reset + ansi.cyan + 'Initializing wave motion core...' + r);
        term.writeln(d + '  [OK] ' + ansi.reset + ansi.cyan + 'Cosmo radar online.' + r);
        term.writeln(d + '  [OK] ' + ansi.reset + ansi.cyan + 'Identity disc: paired' + r);
        term.writeln(d + '  [OK] ' + ansi.reset + ansi.cyan + 'Connection to The Grid: established' + r);
        term.writeln(d + '  [OK] ' + ansi.reset + ansi.greenBright + 'Operator: CygnusWildstar' + r);
        term.writeln('');
        term.writeln(d + '  Type ' + ansi.reset + ansi.greenBright + 'help' + r + d + ' for available commands.' + r);
        term.writeln('');
    }

    // ---- Prompt management ----
    const PROMPT = ansi.cyanBright + 'grid> ' + ansi.reset;
    let currentLine = '';
    let history = [];
    let historyIndex = -1;

    function writePrompt() {
        term.write(PROMPT);
    }

    function newline() {
        term.write('\r\n');
    }

    // ---- Local command dispatcher (Pass 2 — stubbed) ----
    //   Pass 3 will replace this with a POST to /api/command.
    function dispatchCommand(line) {
        const trimmed = line.trim();
        if (trimmed === '') return;

        const [cmd] = trimmed.split(/\s+/);

        switch (cmd.toLowerCase()) {
            case 'help':
                term.writeln(ansi.cyanBright + '  Available commands (Pass 2 — local only):' + ansi.reset);
                term.writeln('');
                term.writeln('    ' + ansi.greenBright + 'help' + ansi.reset + '       — show this message');
                term.writeln('    ' + ansi.greenBright + 'clear' + ansi.reset + '      — clear the terminal');
                term.writeln('');
                term.writeln(ansi.dim + ansi.cyan + '  Pass 3 will add: whoami, date, scan, matrix, status, argo, ...' + ansi.reset);
                term.writeln('');
                break;

            case 'clear':
                term.clear();
                break;

            default:
                term.writeln(ansi.red + '  unknown command: ' + ansi.reset + cmd);
                term.writeln(ansi.dim + ansi.cyan + '  type "help" for a list of available commands.' + ansi.reset);
                break;
        }
    }

    // ---- Input handling ----
    term.onKey(({ key, domEvent }) => {
        const ev = domEvent;
        const printable =
            !ev.altKey && !ev.ctrlKey && !ev.metaKey &&
            key.length === 1 && key.charCodeAt(0) >= 32;

        if (ev.key === 'Enter') {
            newline();
            history.push(currentLine);
            historyIndex = history.length;
            dispatchCommand(currentLine);
            currentLine = '';
            writePrompt();

        } else if (ev.key === 'Backspace') {
            if (currentLine.length > 0) {
                currentLine = currentLine.slice(0, -1);
                // Erase one char: move cursor back, write space, move back again
                term.write('\b \b');
            }

        } else if (ev.key === 'ArrowUp') {
            if (history.length > 0 && historyIndex > 0) {
                historyIndex--;
                replaceCurrentLine(history[historyIndex]);
            }

        } else if (ev.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                replaceCurrentLine(history[historyIndex]);
            } else {
                historyIndex = history.length;
                replaceCurrentLine('');
            }

        } else if (printable) {
            currentLine += key;
            term.write(key);
        }
        // (Tab, function keys, etc. ignored for now — Pass 3 may add tab completion)
    });

    function replaceCurrentLine(newLine) {
        // Erase the current input visually
        while (currentLine.length > 0) {
            term.write('\b \b');
            currentLine = currentLine.slice(0, -1);
        }
        // Write the new line
        currentLine = newLine;
        term.write(newLine);
    }

    // ---- Focus management — clicking anywhere in the pane focuses xterm ----
    document.querySelector('.terminal-pane').addEventListener('click', () => {
        term.focus();
    });

    // ---- Boot sequence ----
    printBanner();
    writePrompt();
    term.focus();

})();