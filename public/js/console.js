// ==========================================================
//  NEO99 :: GRID — Operator Console
//  xterm.js-powered interactive terminal
//  Operator: CygnusWildstar
// ==========================================================
//
// Pass 3: command dispatch via POST /api/command.
//   - The frontend handles input, history, rendering.
//   - The backend handles command logic + responses.
//   - 'clear' is still handled locally (no roundtrip needed).
//   - Special 'effect' field in responses triggers frontend
//     effects like the matrix rain.
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

    // ---- ANSI escape helpers ----
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

    // Map server "color" hint → ANSI sequence
    const colorMap = {
        cyan:        ansi.cyan,
        cyanBright:  ansi.cyanBright,
        green:       ansi.green,
        greenBright: ansi.greenBright,
        red:         ansi.red,
        yellow:      ansi.yellow,
        dim:         ansi.dim + ansi.cyan,
    };

    function colorize(text, color) {
        if (!color || !colorMap[color]) return text;
        return colorMap[color] + text + ansi.reset;
    }

    // ---- Terminal boot ----
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

    const fitAddon = new FitAddon.FitAddon();
    const webLinksAddon = new WebLinksAddon.WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    term.open(document.getElementById('terminal'));
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
        term.writeln(c + '  ║          Operator Console v0.3.0                 ║' + r);
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

    // ---- Prompt + state ----
    const PROMPT = ansi.cyanBright + 'grid> ' + ansi.reset;
    let currentLine = '';
    let history = [];
    let historyIndex = -1;
    let busy = false;     // disable input while command is running

    function writePrompt() {
        term.write(PROMPT);
    }

    function newline() {
        term.write('\r\n');
    }

    // ---- Render lines from the server ----
    function renderLine(line) {
        const text = line.text || '';
        if (text === '') {
            term.writeln('');
            return;
        }
        term.writeln(colorize(text, line.color));
    }

    async function renderLines(lines, animated) {
        if (!lines || lines.length === 0) return;

        if (animated) {
            // Honor per-line delay hints
            for (const line of lines) {
                if (line.delay && line.delay > 0) {
                    await sleep(line.delay - (lines[0].delay || 0));
                }
                renderLine(line);
            }
        } else {
            for (const line of lines) renderLine(line);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ---- Frontend effects ----
    function triggerEffect(effect) {
        if (effect === 'matrix') {
            // Pass 3 stub — Pass 4 may add a real canvas overlay.
            // For now, drop a hint line and let the user imagine.
            term.writeln(ansi.green + '  [the matrix shimmers — effect placeholder]' + ansi.reset);
        }
    }

    // ---- Command dispatch ----
    async function dispatchCommand(line) {
        const trimmed = line.trim();
        if (trimmed === '') return;

        // 'clear' stays local for instant response
        if (trimmed.toLowerCase() === 'clear') {
            term.clear();
            return;
        }

        busy = true;
        try {
            const res = await fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: trimmed }),
            });

            if (!res.ok) {
                term.writeln(ansi.red + `  HTTP ${res.status} — server error` + ansi.reset);
                return;
            }

            const data = await res.json();
            await renderLines(data.lines, data.animated);
            if (data.effect) triggerEffect(data.effect);

        } catch (err) {
            term.writeln(ansi.red + `  network error: ${err.message}` + ansi.reset);
            term.writeln(ansi.dim + ansi.cyan + '  is the server running?' + ansi.reset);
        } finally {
            busy = false;
        }
    }

    // ---- Input handling ----
    term.onKey(({ key, domEvent }) => {
        if (busy) return;            // ignore keystrokes while a command runs

        const ev = domEvent;
        const printable =
            !ev.altKey && !ev.ctrlKey && !ev.metaKey &&
            key.length === 1 && key.charCodeAt(0) >= 32;

        if (ev.key === 'Enter') {
            newline();
            const line = currentLine;
            history.push(line);
            historyIndex = history.length;
            currentLine = '';
            // Note: writePrompt happens AFTER the async dispatch completes
            dispatchCommand(line).then(() => writePrompt());

        } else if (ev.key === 'Backspace') {
            if (currentLine.length > 0) {
                currentLine = currentLine.slice(0, -1);
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
    });

    function replaceCurrentLine(newLine) {
        while (currentLine.length > 0) {
            term.write('\b \b');
            currentLine = currentLine.slice(0, -1);
        }
        currentLine = newLine;
        term.write(newLine);
    }

    document.querySelector('.terminal-pane').addEventListener('click', () => {
        term.focus();
    });

    // ---- Boot sequence ----
    printBanner();
    writePrompt();
    term.focus();

})();