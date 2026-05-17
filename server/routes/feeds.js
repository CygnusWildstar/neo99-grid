// ==========================================================
//  GET /api/feeds          → all sources, all items
//  GET /api/feeds/:source  → one source only
// ==========================================================

import express from 'express';
import { cache, sources } from '../services/feeds/index.js';

const router = express.Router();

router.get('/feeds', (req, res) => {
    const all = cache.getAll();

    // Return in the order defined in sources.js (predictable UI ordering)
    const ordered = sources.map(s => ({
        id:        s.id,
        label:     s.label,
        items:     all[s.id]?.items || [],
        updatedAt: all[s.id]?.updatedAt || null,
        error:     all[s.id]?.error || null,
    }));

    res.json({
        ok:    true,
        ready: cache.isReady(),
        sources: ordered,
    });
});

router.get('/feeds/:source', (req, res) => {
    const entry = cache.get(req.params.source);
    if (!entry) {
        return res.status(404).json({ ok: false, error: 'source not found' });
    }
    res.json({ ok: true, source: req.params.source, ...entry });
});

export default router;