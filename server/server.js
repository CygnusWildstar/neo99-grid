// ============================================================
//  Neo99 Grid :: Operator Console
//  Express server entry point
//  Operator: CygnusWildstar
// ============================================================

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// ES modules don't have __dirname by default — derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the public directory relative to this file
const publicDir = path.resolve(__dirname, '..', 'public');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
// Serve everything in /public as static assets
app.use(express.static(publicDir));

// ---- Routes ----

// Root route — for now, send a TRON-themed text response
// (we'll replace this with index.html in the next phase)
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        operator: 'CygnusWildstar',
        grid: 'neo99',
        timestamp: new Date().toISOString(),
        message: 'Greetings, Program.'
    });
});

// Health check endpoint — Azure App Service uses this
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
    console.log(`  ║   Started      : ${new Date().toISOString().padEnd(24, ' ')}║`);
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log('  Endpoints:');
    console.log(`    GET  /              → static content from /public`);
    console.log(`    GET  /api/status    → server status JSON`);
    console.log(`    GET  /healthz       → health check (for App Service)`);
    console.log('');
    console.log('  End of line. ◢◣');
    console.log('');
});