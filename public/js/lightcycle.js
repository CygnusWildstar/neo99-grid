// ==========================================================
//  NEO99 :: GRID — Lightcycle Arena (v3 — direction-aware)
//
//  Each cell stores `enterDir` (how the bike arrived) and
//  `leaveDir` (how it left, or null if it's the current head).
//  This lets us pick the exactly correct trail glyph instead
//  of guessing from neighbors.
//
//  Directions: 0=N, 1=E, 2=S, 3=W
// ==========================================================

(function () {
    'use strict';

    const COLS = 70;
    const ROWS = 9;
    const TICK_MS = 200;
    const RESET_DELAY_MS = 2000;

    const EMPTY = ' ';
    const WALL_H = '─';
    const WALL_V = '│';
    const CORNER_TL = '┌';  const CORNER_TR = '┐';
    const CORNER_BL = '└';  const CORNER_BR = '┘';

    const HEAD = { 0: '▲', 1: '►', 2: '▼', 3: '◄' };

    // ---- The glyph table — keyed by (enterDir << 2 | leaveDir) ----
    // Direction codes: 0=N, 1=E, 2=S, 3=W
    // Key formula: enterDir * 4 + leaveDir
    const TRAIL_GLYPH = {
        // Came from west (entered going E), leaving in some direction
        [1*4 + 1]: '━',   // E → E : straight horizontal
        [1*4 + 0]: '┛',   // E → N : turn up (corner from going east, now going north)
        [1*4 + 2]: '┓',   // E → S : turn down

        // Came from east (entered going W), leaving
        [3*4 + 3]: '━',   // W → W : straight horizontal
        [3*4 + 0]: '┗',   // W → N : turn up
        [3*4 + 2]: '┏',   // W → S : turn down

        // Came from north (entered going S), leaving
        [2*4 + 2]: '┃',   // S → S : straight vertical
        [2*4 + 1]: '┗',   // S → E : turn right
        [2*4 + 3]: '┛',   // S → W : turn left

        // Came from south (entered going N), leaving
        [0*4 + 0]: '┃',   // N → N : straight vertical
        [0*4 + 1]: '┏',   // N → E : turn right
        [0*4 + 3]: '┓',   // N → W : turn left
    };

    const $pane     = document.querySelector('.lightcycle-pane');
    const $arena    = document.getElementById('lightcycle-arena');
    const $status   = document.getElementById('lightcycle-status');
    const $p1score  = document.getElementById('lc-p1-score');
    const $cpuscore = document.getElementById('lc-cpu-score');

    if (!$pane || !$arena) {
        console.warn('[lightcycle] DOM elements not found');
        return;
    }

    let grid = [];          // grid[y][x] = { owner, enterDir, leaveDir }
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
            for (let x = 0; x < COLS; x++) {
                row.push({ owner: null, enterDir: null, leaveDir: null });
            }
            g.push(row);
        }
        return g;
    }

    function spawnBikes() {
        p1  = { x: COLS - 10, y: Math.floor(ROWS / 2), dir: 3, alive: true };
        cpu = { x: 10,        y: Math.floor(ROWS / 2), dir: 1, alive: true };
        // Mark spawn cells. Use dir as both enter and leave so the spawn
        // renders as a straight piece in the bike's facing direction.
        grid[p1.y][p1.x]   = { owner: 'p1',  enterDir: p1.dir,  leaveDir: p1.dir };
        grid[cpu.y][cpu.x] = { owner: 'cpu', enterDir: cpu.dir, leaveDir: cpu.dir };
        nextDir = null;
        roundEnding = false;
    }

    function resetArena() {
        if (resetHandle) { clearTimeout(resetHandle); resetHandle = null; }
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

    function nextPos(bike) {
        return {
            x: bike.x + (bike.dir === 1 ? 1 : bike.dir === 3 ? -1 : 0),
            y: bike.y + (bike.dir === 2 ? 1 : bike.dir === 0 ? -1 : 0),
        };
    }

    function tick() {
        if (paused || roundEnding) return;

        // Snapshot direction the bike WAS traveling at the start of this tick
        const p1OldDir  = p1.dir;
        const cpuOldDir = cpu.dir;

        // Apply player turn (forbid 180° reversal)
        if (nextDir !== null) {
            if (Math.abs(nextDir - p1.dir) !== 2) p1.dir = nextDir;
            nextDir = null;
        }

        cpu.dir = chooseCpuDir();

        // Update the leaveDir of the cell the bike is currently in BEFORE moving
        // This handles corners: cell remembers what direction the bike LEFT it in.
        if (grid[p1.y][p1.x].owner === 'p1') {
            grid[p1.y][p1.x].leaveDir = p1.dir;
        }
        if (grid[cpu.y][cpu.x].owner === 'cpu') {
            grid[cpu.y][cpu.x].leaveDir = cpu.dir;
        }

        // Compute next positions
        const np1  = nextPos(p1);
        const ncpu = nextPos(cpu);

        function crashCheck(np) {
            if (np.x < 0 || np.x >= COLS || np.y < 0 || np.y >= ROWS) return true;
            if (grid[np.y][np.x].owner !== null) return true;
            return false;
        }

        const p1Crash  = crashCheck(np1);
        const cpuCrash = crashCheck(ncpu);
        const swap = (np1.x === cpu.x && np1.y === cpu.y && ncpu.x === p1.x && ncpu.y === p1.y);
        const sameCell = (np1.x === ncpu.x && np1.y === ncpu.y);

        if (swap || sameCell) {
            p1.alive = false;
            cpu.alive = false;
        } else {
            if (p1Crash)  p1.alive  = false;
            if (cpuCrash) cpu.alive = false;
        }

        // Apply movement only for alive bikes
        if (p1.alive) {
            p1.x = np1.x; p1.y = np1.y;
            // New cell: bike ENTERED moving in p1.dir, no leaveDir yet (it's the head)
            grid[p1.y][p1.x] = { owner: 'p1', enterDir: p1.dir, leaveDir: p1.dir };
        }
        if (cpu.alive) {
            cpu.x = ncpu.x; cpu.y = ncpu.y;
            grid[cpu.y][cpu.x] = { owner: 'cpu', enterDir: cpu.dir, leaveDir: cpu.dir };
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
            resetHandle = setTimeout(() => resetArena(), RESET_DELAY_MS);
        }
    }

    function trailGlyph(cell) {
        // Direction-aware: cell knows how the bike entered and left it.
        const key = cell.enterDir * 4 + cell.leaveDir;
        return TRAIL_GLYPH[key] || '━';
    }

    function span(text, color) {
        const c = color === 'cyan' ? '#00ffff'
                : color === 'magenta' ? '#ff66cc'
                : color === 'dim' ? '#008888'
                : '#00ffff';
        return '<span style="color:' + c + '">' + text + '</span>';
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
                    row += span(trailGlyph(cell), 'cyan');
                } else if (cell.owner === 'cpu') {
                    row += span(trailGlyph(cell), 'magenta');
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
            ? base + ' · <span style="color:#ffcc44">' + extra + '</span>'
            : base;
    }

    function updateScore() {
        if ($p1score)  $p1score.textContent  = String(p1Score);
        if ($cpuscore) $cpuscore.textContent = String(cpuScore);
    }

    function gainFocus() {
        focused = true;
        if (!roundEnding) paused = false;
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
        reset()      { resetArena(); },
        pause()      { paused = true; },
        resume()     { if (focused) paused = false; },
        score()      { return { p1: p1Score, cpu: cpuScore }; },
        resetScore() { p1Score = 0; cpuScore = 0; updateScore(); },
    };

    resetArena();
    updateScore();
    setInterval(tick, TICK_MS);
})();
