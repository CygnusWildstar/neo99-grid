// ==========================================================
//  NEO99 :: GRID — Lightcycle Arena
//
//  ASCII lightcycle game. Player (cyan) vs CPU (magenta).
//  Click to take control; Esc returns to terminal.
//  Game pauses when terminal has focus.
// ==========================================================

(function () {
    'use strict';

    const COLS = 90;
    const ROWS = 6;
    const TICK_MS = 150;

    const EMPTY = ' ';
    const WALL_H = '─';
    const WALL_V = '│';
    const CORNER_TL = '┌';  const CORNER_TR = '┐';
    const CORNER_BL = '└';  const CORNER_BR = '┘';

    const HEAD = { 0: '▲', 1: '►', 2: '▼', 3: '◄' };
    const TRAIL_H = '━';
    const TRAIL_V = '┃';

    const $pane     = document.querySelector('.lightcycle-pane');
    const $arena    = document.getElementById('lightcycle-arena');
    const $status   = document.getElementById('lightcycle-status');
    const $p1score  = document.getElementById('lc-p1-score');
    const $cpuscore = document.getElementById('lc-cpu-score');

    if (!$pane || !$arena) {
        console.warn('[lightcycle] DOM elements not found');
        return;
    }

    let grid = [];
    let p1, cpu;
    let nextDir = null;
    let p1Score = 0, cpuScore = 0;
    let roundEnding = false;
    let paused = true;
    let focused = false;
    let resetHandle = null;

    function makeEmptyGrid() {
        const g = [];
        for (let y = 0; y < ROWS; y++) {
            const row = [];
            for (let x = 0; x < COLS; x++) row.push({ owner: null });
            g.push(row);
        }
        return g;
    }

    function spawnBikes() {
        p1  = { x: COLS - 10, y: Math.floor(ROWS / 2), dir: 3, alive: true };
        cpu = { x: 10,        y: Math.floor(ROWS / 2), dir: 1, alive: true };
        nextDir = null;
        roundEnding = false;
    }

    function resetArena() {
        grid = makeEmptyGrid();
        spawnBikes();
        renderStatus('');
        render();
    }

    function isSafe(x, y, d) {
        const nx = x + (d === 1 ? 1 : d === 3 ? -1 : 0);
        const ny = y + (d === 2 ? 1 : d === 0 ? -1 : 0);
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
        return grid[ny][nx].owner === null;
    }

    function chooseCpuDir() {
        const d = cpu.dir;
        if (isSafe(cpu.x, cpu.y, d)) {
            if (Math.random() < 0.04) {
                const left = (d + 3) % 4, right = (d + 1) % 4;
                if (isSafe(cpu.x, cpu.y, left) && isSafe(cpu.x, cpu.y, right)) {
                    return Math.random() < 0.5 ? left : right;
                }
            }
            return d;
        }
        const left = (d + 3) % 4, right = (d + 1) % 4;
        if (isSafe(cpu.x, cpu.y, left) && isSafe(cpu.x, cpu.y, right)) {
            return Math.random() < 0.5 ? left : right;
        }
        if (isSafe(cpu.x, cpu.y, left)) return left;
        if (isSafe(cpu.x, cpu.y, right)) return right;
        return d;
    }

    function advance(bike, owner) {
        bike.x += (bike.dir === 1 ? 1 : bike.dir === 3 ? -1 : 0);
        bike.y += (bike.dir === 2 ? 1 : bike.dir === 0 ? -1 : 0);
        if (bike.x < 0 || bike.x >= COLS || bike.y < 0 || bike.y >= ROWS) {
            bike.alive = false;
            return;
        }
        if (grid[bike.y][bike.x].owner !== null) {
            bike.alive = false;
            return;
        }
        grid[bike.y][bike.x] = { owner };
    }

    function tick() {
        if (paused || roundEnding) return;

        if (nextDir !== null) {
            if (Math.abs(nextDir - p1.dir) !== 2) p1.dir = nextDir;
            nextDir = null;
        }

        cpu.dir = chooseCpuDir();

        advance(p1, 'p1');
        advance(cpu, 'cpu');

        if (p1.alive && cpu.alive && p1.x === cpu.x && p1.y === cpu.y) {
            p1.alive = false;
            cpu.alive = false;
        }

        render();

        if (!p1.alive || !cpu.alive) {
            roundEnding = true;
            let msg;
            if (!p1.alive && !cpu.alive) {
                msg = 'DRAW';
            } else if (!p1.alive) {
                cpuScore++;
                msg = 'CPU WIN';
                if (window.NEO99_audio) window.NEO99_audio.play('error');
            } else {
                p1Score++;
                msg = 'P1 WIN';
                if (window.NEO99_audio) window.NEO99_audio.play('success');
            }
            renderStatus(msg);
            updateScore();
            resetHandle = setTimeout(() => resetArena(), 2000);
        }
    }

    function trailGlyph(x, y) {
        const owner = grid[y][x].owner;
        const left  = x > 0       && grid[y][x-1].owner === owner;
        const right = x < COLS-1  && grid[y][x+1].owner === owner;
        const up    = y > 0       && grid[y-1][x].owner === owner;
        const down  = y < ROWS-1  && grid[y+1][x].owner === owner;
        const h = left || right;
        const v = up || down;
        if (h && v) {
            if (right && down) return '┏';
            if (left  && down) return '┓';
            if (right && up)   return '┗';
            if (left  && up)   return '┛';
            return TRAIL_H;
        }
        if (v) return TRAIL_V;
        return TRAIL_H;
    }

    function span(text, color) {
        const c = color === 'cyan' ? '#00ffff'
                : color === 'magenta' ? '#ff66cc'
                : color === 'dim' ? '#008888'
                : '#00ffff';
        return `<span style="color:${c}">${text}</span>`;
    }

    function render() {
        const lines = [];
        const topBorder = CORNER_TL + WALL_H.repeat(COLS) + CORNER_TR;
        lines.push(span(topBorder, 'dim'));

        for (let y = 0; y < ROWS; y++) {
            let row = span(WALL_V, 'dim');
            for (let x = 0; x < COLS; x++) {
                const cell = grid[y][x];
                if (p1.alive && x === p1.x && y === p1.y) {
                    row += span(HEAD[p1.dir], 'cyan');
                } else if (cpu.alive && x === cpu.x && y === cpu.y) {
                    row += span(HEAD[cpu.dir], 'magenta');
                } else if (cell.owner === 'p1') {
                    row += span(trailGlyph(x, y), 'cyan');
                } else if (cell.owner === 'cpu') {
                    row += span(trailGlyph(x, y), 'magenta');
                } else {
                    row += EMPTY;
                }
            }
            row += span(WALL_V, 'dim');
            lines.push(row);
        }

        const botBorder = CORNER_BL + WALL_H.repeat(COLS) + CORNER_BR;
        lines.push(span(botBorder, 'dim'));

        $arena.innerHTML = lines.join('\n');
    }

    function renderStatus(extra) {
        const base = focused
            ? '// LIGHTCYCLE ARENA · <span style="color:#00ff99">FOCUSED</span> · esc to release'
            : '// LIGHTCYCLE ARENA · click to focus · esc to release';
        $status.innerHTML = extra
            ? `${base} · <span style="color:#ffcc44">${extra}</span>`
            : base;
    }

    function updateScore() {
        if ($p1score)  $p1score.textContent  = String(p1Score);
        if ($cpuscore) $cpuscore.textContent = String(cpuScore);
    }

    function gainFocus() {
        focused = true;
        paused = false;
        $pane.classList.add('focused');
        renderStatus('');
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
    }

    function releaseFocus() {
        focused = false;
        paused = true;
        $pane.classList.remove('focused');
        renderStatus('');
        const terminalEl = document.querySelector('.terminal-pane .xterm-helper-textarea');
        if (terminalEl) terminalEl.focus();
    }

    $pane.addEventListener('click', (e) => {
        gainFocus();
        e.stopPropagation();
    });

    document.addEventListener('keydown', (e) => {
        if (!focused) return;

        if (e.key === 'Escape') {
            releaseFocus();
            e.preventDefault();
            return;
        }

        const dirMap = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
        if (e.key in dirMap) {
            nextDir = dirMap[e.key];
            e.preventDefault();
            if (window.NEO99_audio) window.NEO99_audio.play('keystroke');
        }
    });

    window.NEO99_lightcycle = {
        reset()      { clearTimeout(resetHandle); resetArena(); },
        pause()      { paused = true; },
        resume()     { if (focused) paused = false; },
        score()      { return { p1: p1Score, cpu: cpuScore }; },
        resetScore() { p1Score = 0; cpuScore = 0; updateScore(); },
    };

    resetArena();
    updateScore();
    setInterval(tick, TICK_MS);
})();