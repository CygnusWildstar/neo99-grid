// ============================================================
//  Neo99 Grid :: Operator Console
//  Express server entry point
//  Operator: CygnusWildstar
// ============================================================

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

import commandRouter from './routes/command.js';
import feedsRouter from './routes/feeds.js';
import telemetryRouter from './routes/telemetry.js';
import { commands } from './commands/index.js';
import { startFeedService, sources as feedSources } from './services/feeds/index.js';
import { telemetry } from './services/telemetry/counter.js';
import { netviz }    from './services/netviz/tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

const app = express();
const PORT = process.env.PORT || 3000;
// ---- System info captured at boot ----
// These values describe what's running and when this deploy happened.
// Surfaced via /api/sysinfo for the System Telemetry panel.
const SYSTEM_INFO = {
    region:    process.env.AZURE_REGION || 'Azure West US 2',
    runtime:   `Node ${process.version}`,
    host:      process.env.WEBSITE_HOSTNAME || 'localhost',
    bootTime:  new Date().toISOString(),
    commit:    (process.env.GIT_COMMIT_SHA || 'local').substring(0, 7),
    commitFull:(process.env.GIT_COMMIT_SHA || 'local'),
    deployTime:process.env.DEPLOY_TIME || null,
    repoUrl:   'https://github.com/CygnusWildstar/neo99-grid',
};



// ---- Canonical hostname redirect ----
// www.neo99.com (and any other non-canonical hostname) is 301-redirected
// to https://neo99.com to keep one canonical URL for SEO, analytics, and
// cookie scoping. Skipped when running locally (PORT defaulted to 3000).
app.use((req, res, next) => {
    if (req.hostname === 'www.neo99.com') {
        return res.redirect(301, `https://neo99.com${req.originalUrl}`);
    }
    next();
});

// ---- Network activity tracker ----
// Hooks every request's 'finish' event to record route/status data
// for the System Telemetry's sibling /api/netviz panel.
app.use(netviz.middleware());

// ---- Middleware ----
app.use(express.json({ limit: '64kb' }));

// Session cookie middleware — sets a random id on first visit so
// we can dedupe visitor counts. Cookie is httpOnly so JS can't read it.
app.use((req, res, next) => {
    const cookieName = 'neo99_sess';
    const existing = req.headers.cookie?.split(';')
        .find(c => c.trim().startsWith(cookieName + '='));

    let sessionId;
    if (existing) {
        sessionId = existing.split('=')[1].trim();
    } else {
        sessionId = crypto.randomBytes(16).toString('hex');
        // Cookie expires in 24h, same-origin only
        res.setHeader('Set-Cookie',
            `${cookieName}=${sessionId}; HttpOnly; SameSite=Lax; Max-Age=86400; Path=/`);
    }

    req.sessionId = sessionId;
    telemetry.bumpVisitor(sessionId);
    next();
});

app.use(express.static(publicDir));

// ---- Routes ----
app.use('/api', commandRouter);
app.use('/api', feedsRouter);
app.use('/api', telemetryRouter);

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        operator: 'CygnusWildstar',
        grid: 'neo99',
        commands: commands.size,
        feeds:    feedSources.length,
        timestamp: new Date().toISOString(),
        message: 'Greetings, Program.',
    });
});



app.get('/api/sysinfo', (req, res) => {
    res.json({
        ...SYSTEM_INFO,
        uptime: process.uptime(),
        heapMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
    });
});

app.get('/api/netviz', (req, res) => {
    res.json(netviz.snapshot());
});

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// ---- Boot ----
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║         NEO99 GRID :: ONLINE             ║');
    console.log('  ╠══════════════════════════════════════════╣');
    console.log(`  ║   Operator     : CygnusWildstar          ║`);
    console.log(`  ║   Port         : ${String(PORT).padEnd(24, ' ')}║`);
    console.log(`  ║   Mode         : ${(process.env.NODE_ENV || 'development').padEnd(24, ' ')}║`);
    console.log(`  ║   Commands     : ${String(commands.size).padEnd(24, ' ')}║`);
    console.log(`  ║   Feed sources : ${String(feedSources.length).padEnd(24, ' ')}║`);
    console.log(`  ║   Started      : ${new Date().toISOString().padEnd(24, ' ')}║`);
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log('  Endpoints:');
    console.log(`    GET   /                  → static content from /public`);
    console.log(`    POST  /api/command       → operator command dispatch`);
    console.log(`    GET   /api/feeds         → all cached feed items`);
    console.log(`    GET   /api/feeds/:source → one source only`);
    console.log(`    GET   /api/telemetry     → live HUD telemetry`);
    console.log(`    GET   /api/status        → server status JSON`);
    console.log(`    GET   /healthz           → health check (for App Service)`);

    startFeedService();

    console.log('  End of line. ◢◣');
    console.log('');
});
