// ==========================================================
//  NEO99 :: GRID — Audio Engine
//
//  Web Audio API synthesis. No audio files. Every sound is
//  generated in real time using oscillators + gain envelopes.
//
//  Browsers gate AudioContext until the user has interacted
//  with the page (autoplay policy). We initialize on first
//  click/key, then everything just works.
// ==========================================================

(function () {
    'use strict';

    let ctx = null;
    let masterGain = null;
    let muted = false;
    let armed = false;

    // ---- Lazy init: only build the audio graph on first user gesture ----
    function ensureContext() {
        if (ctx) return ctx;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            ctx = new AudioCtx();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.3;             // overall volume ceiling
            masterGain.connect(ctx.destination);
            return ctx;
        } catch (e) {
            console.warn('[audio] Web Audio API not available:', e);
            return null;
        }
    }

    // Arm the audio system on first user gesture.
    function arm() {
        if (armed) return;
        armed = true;
        const c = ensureContext();
        if (c && c.state === 'suspended') c.resume();
    }

    document.addEventListener('click',   arm, { once: true, capture: true });
    document.addEventListener('keydown', arm, { once: true, capture: true });

    // ---- Primitive: short oscillator note with envelope ----
    function tone({ freq, duration = 0.08, type = 'sine', gain = 0.4, attack = 0.005, release = 0.05 }) {
        if (muted || !ctx) return;
        const t0 = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(gain, t0 + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(t0);
        osc.stop(t0 + duration + release);
    }

    // ---- Frequency sweep (pew sounds) ----
    function sweep({ from, to, duration = 0.15, type = 'sine', gain = 0.3 }) {
        if (muted || !ctx) return;
        const t0 = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(from, t0);
        osc.frequency.exponentialRampToValueAtTime(to, t0 + duration);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(t0);
        osc.stop(t0 + duration + 0.05);
    }

    // ---- The sound palette ----
    const sounds = {
        keystroke() {
            // Very short, soft click — randomize freq slightly for variation
            const f = 800 + (Math.random() * 100 - 50);
            tone({ freq: f, duration: 0.025, type: 'square', gain: 0.05 });
        },

        enter() {
            // Slightly deeper "thunk" for Enter
            tone({ freq: 480, duration: 0.06, type: 'square', gain: 0.12 });
        },

        success() {
            // Two-tone ascending: C5 → E5
            tone({ freq: 523.25, duration: 0.08, type: 'sine', gain: 0.2 });
            setTimeout(() => tone({ freq: 659.25, duration: 0.1, type: 'sine', gain: 0.2 }), 80);
        },

        error() {
            // Sawtooth buzz, low
            tone({ freq: 180, duration: 0.18, type: 'sawtooth', gain: 0.15 });
            setTimeout(() => tone({ freq: 140, duration: 0.18, type: 'sawtooth', gain: 0.15 }), 60);
        },

        boot() {
            // Rising arpeggio — C4, E4, G4, C5
            const notes = [261.63, 329.63, 392.00, 523.25];
            notes.forEach((freq, i) => {
                setTimeout(() => tone({ freq, duration: 0.12, type: 'triangle', gain: 0.2 }), i * 80);
            });
        },

        themeChange() {
            // Bell-like sweep, downward — feels like a chime
            sweep({ from: 880, to: 440, duration: 0.25, type: 'sine', gain: 0.18 });
        },

        alert() {
            // Soft two-pulse chime for feed refresh
            tone({ freq: 698.46, duration: 0.06, type: 'sine', gain: 0.1 });
            setTimeout(() => tone({ freq: 698.46, duration: 0.06, type: 'sine', gain: 0.1 }), 120);
        },
    };

    // ---- Public API ----
    window.NEO99_audio = {
        play(name) {
            ensureContext();
            const s = sounds[name];
            if (s) s();
        },
        mute() {
            muted = true;
        },
        unmute() {
            muted = false;
        },
        isMuted() {
            return muted;
        },
        toggle() {
            muted = !muted;
            return muted;
        },
    };
})();