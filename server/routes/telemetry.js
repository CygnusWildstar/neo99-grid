// ==========================================================
//  GET /api/telemetry — Live server telemetry for the HUD
// ==========================================================

import express from 'express';
import { telemetry } from '../services/telemetry/counter.js';

const router = express.Router();

router.get('/telemetry', (req, res) => {
    // No cache — this data is intentionally fresh on every poll
    res.set('Cache-Control', 'no-store');
    res.json({
        ok: true,
        ...telemetry.snapshot(),
        timestamp: new Date().toISOString(),
    });
});

export default router;