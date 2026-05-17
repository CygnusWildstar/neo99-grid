// ==========================================================
//  POST /api/command — Operator command dispatch endpoint
// ==========================================================

import express from 'express';
import { runCommand } from '../commands/index.js';
import { telemetry } from '../services/telemetry/counter.js';

const router = express.Router();

router.post('/command', async (req, res) => {
    const { command } = req.body || {};

    if (typeof command !== 'string') {
        return res.status(400).json({
            ok: false,
            lines: [
                { text: 'invalid request: command must be a string', color: 'red' },
            ],
        });
    }

    const trimmed = command.trim();
    if (trimmed === '') {
        return res.json({ ok: true, lines: [] });
    }

    const [name, ...args] = trimmed.split(/\s+/);

    const context = {
        ip: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        sessionId: req.sessionId,
    };

    const result = await runCommand(name, args, context);
    telemetry.bumpCommand();
    res.json(result);
});

export default router;