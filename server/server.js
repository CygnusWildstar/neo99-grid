// ============================================================
//  Neo99 Grid :: Operator Console
//  Express server entry point
//  Operator: CygnusWildstar
// ============================================================

import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import commandRouter from './routes/command.js';
import { commands } from './commands/index.js';

// ES modules don't have __dirname by default — derive it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the public directory relative to this file
const publicDir = path.resolve(__dirname, '..', 'public');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json({ limit: '64kb' }));
app.use(express.static(publicDir));

// ---- Routes ----

// Command dispatcher (POST /api/command)
app.use('/api', commandRouter);

// Server status JSON
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        operator: 'CygnusWildstar',
        grid: 'neo99',
        commands: commands.size,
        timestamp: new Date().toISOString(),
        message: 'Greetings, Program.',
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
    console.log(`  ║   Commands     : ${String(commands.size).padEnd(24, ' ')}║`);
    console.log(`  ║   Started      : ${new Date().toISOString().padEnd(24, ' ')}║`);
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log('  Endpoints:');
    console.log(`    GET   /              → static content from /public`);
    console.log(`    POST  /api/command   → operator command dispatch`);
    console.log(`    GET   /api/status    → server status JSON`);
    console.log(`    GET   /healthz       → health check (for App Service)`);
    console.log('');
    console.log('  End of line. ◢◣');
    console.log('');
});