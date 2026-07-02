# The Neo99 Grid

> _"I tried to picture clusters of information as they moved through the computer.  
> What did they look like? Ships? Motorcycles? Were the circuits like freeways?  
> I kept dreaming of a world I thought I'd never see. And then, one day, I got in."_  
> — Kevin Flynn, **TRON** (1982)

A cyberpunk operator console deployed on Microsoft Azure. Live RSS aggregator,
in-browser xterm.js terminal with 21+ commands, ASCII lightcycle game, live
deploy telemetry, and a live network activity visualizer. Built as a hands-on
AZ-104 / Cloud Engineering learning project by **CygnusWildstar**.

**🟦 Live:** [https://neo99.com](https://neo99.com)

---

## What it does

```
┌────────────────────────────────┬──────────────────────────────┐
│                                │  HACKER NEWS                 │
│                                │  ↕ scrollable                │
│  OPERATOR TERMINAL             ├──────────────────────────────┤
│  (xterm.js + 21 commands)      │  ARS TECHNICA                │
│                                │  ↕ scrollable                │
│  grid> help                    ├──────────────────────────────┤
│  grid> theme matrix            │  THE VERGE                   │
│  grid> lightcycle start        │  ↕ scrollable                │
│  grid> motd                    ├──────────────────────────────┤
│                                │  MICROSOFT AZURE             │
│                                │  ↕ scrollable                │
│                                ├──────────────────────────────┤
│                                │  AZURE UPDATES               │
│                                │  ↕ scrollable                │
├────────────────────┬───────────┴─────┬────────────────────────┤
│   LIGHTCYCLE       │  NETWORK        │   SYSTEM TELEMETRY     │
│   (ASCII game)     │  ACTIVITY       │   region, runtime,     │
│                    │  (live req feed)│   commit, uptime, heap │
└────────────────────┴─────────────────┴────────────────────────┘
```

- **Operator Terminal** — Real [xterm.js](https://xtermjs.org/) terminal with
  command dispatcher, history, themes, audio synthesis (Web Audio API,
  no audio files), and an embedded ASCII lightcycle game with
  direction-aware trail glyphs.

- **News Feed Aggregator** — Five RSS sources (Hacker News, Ars Technica,
  The Verge, Microsoft Azure blog, Azure Updates). Per-feed scrolling
  with cyan-themed scrollbars. Anti-corruption layer normalizes all
  feeds to a single shape.

- **Lightcycle Arena** — Single-player ASCII grid game. Each cell tracks
  enter/leave directions to pick the exact correct Unicode box-drawing
  glyph for the trail. Click to focus, arrow keys to steer, Esc to release.

- **Network Activity Visualizer** — Live ops dashboard showing real-time
  HTTP request activity. Each request appears as an animated row with
  method, path, and status code. Color-coded errors (4xx/5xx in red),
  rolling 30-second window, top-routes ranking, and global hit/error
  counts since boot. Filters out its own polling traffic so the display
  shows real application work, not dashboard heartbeat.

- **System Telemetry** — Live dashboard showing the running region, Node
  runtime, hostname, boot time, uptime, heap usage, and the exact Git
  commit SHA powering the response (clickable to inspect the code on
  GitHub).

---

## Stack

| Layer         | Tech                                                |
| ------------- | --------------------------------------------------- |
| Runtime       | Node.js 22 LTS                                      |
| Server        | Express 5                                           |
| Frontend      | Vanilla HTML/CSS/JS + xterm.js (no framework)       |
| Audio         | Web Audio API (synthesized tones, no audio files)   |
| RSS parsing   | `rss-parser` + custom anti-corruption layer         |
| Hosting       | Azure App Service (Linux B1, West US 2)             |
| TLS           | Azure App Service Managed Certificates (auto-renew) |
| Observability | Application Insights (workspace-based, 90d retain)  |
| CI/CD         | GitHub Actions → service principal → `az webapp`    |
| Domain        | `neo99.com` (apex canonical) + `www` 301 redirect   |
| Cost          | ~$13/mo (B1 plan) + ~$0 Application Insights        |

---

## Architecture

```
GitHub push to main
     │
     ▼
GitHub Actions runner (Ubuntu 24.04)
     │  npm ci → build → azure/login@v2 (service principal)
     ▼
azure/webapps-deploy@v3
     │
     ▼
Azure App Service (Linux B1) ──── stamps GIT_COMMIT_SHA + DEPLOY_TIME
     │                            into App Settings via `az webapp`
     ▼
Container restart with new env vars
     │
     ▼
Express app reads SYSTEM_INFO at boot
     │  request middleware tracks all routes for /api/netviz
     ▼
Live at https://neo99.com (managed TLS, apex canonical)
```

Total deploy time from `git push` to live: **~90 seconds.**

### Live operator dashboards

Two real-time panels in the bottom row pair the application with
observability about itself:

| Panel              | Endpoint        | Cadence | Width | Purpose                              |
| ------------------ | --------------- | ------- | ----- | ------------------------------------ |
| Network Activity   | `/api/netviz`   | 1.2 s   | 420px | recent requests, top routes, errors  |
| System Telemetry   | `/api/sysinfo`  | 10 s    | 560px | region, runtime, commit, uptime, heap|

The network tracker is in-memory only (rolling 30-second window, capped
event buffer) so it adds essentially zero overhead per request.

---

## Commands

Inside the operator terminal:

| Command             | Effect                                              |
| ------------------- | --------------------------------------------------- |
| `help`              | Show all commands                                   |
| `whoami`            | Identify the current operator                       |
| `date` / `uptime`   | Current date or process uptime                      |
| `status`            | Backend status dump                                 |
| `scan`              | Animated subsystem scan                             |
| `matrix`            | Digital rain effect                                 |
| `argo` / `wildstar` | Star Blazers reference                              |
| `version`           | Build + commit info                                 |
| `weather`           | Current operator weather (geo-stub)                 |
| `connect <host>`    | Mock connection to a system                         |
| `ascii <subject>`   | ASCII art generator                                 |
| `motd`              | Random message of the day                           |
| `ping <host>`       | Mock ping with simulated latency                    |
| `theme <name>`      | Switch theme (tron, matrix, amber, magenta)         |
| `mute` / `unmute`   | Toggle UI sound effects                             |
| `lightcycle start`  | Drop into the ASCII lightcycle game                 |
| `lightcycle reset`  | Restart the arena                                   |
| `lightcycle quit`   | Exit back to the terminal                           |
| `echo <text>`       | Echo back text                                      |
| `clear`             | Clear the terminal                                  |

---

## API surface

| Endpoint             | Returns                                              |
| -------------------- | ---------------------------------------------------- |
| `GET /api/status`    | Backend status: online, operator, command/feed count |
| `GET /api/feeds`     | Aggregated RSS items normalized to a single shape    |
| `GET /api/sysinfo`   | SYSTEM_INFO at boot + live uptime/heap               |
| `GET /api/netviz`    | Recent requests (rolling 30s), top routes, errors    |
| `GET /api/telemetry` | Visitor counter snapshot                             |
| `GET /healthz`       | Always 200 OK (used by App Service health checks)    |
| `POST /api/command`  | Run a terminal command (used by the xterm front-end) |

## Security

Every response is hardened by [helmet](https://helmetjs.github.io/), applied
before any static asset or route so the entire surface is covered:

| Header | Value |
| ------ | ----- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

The `X-Powered-By: Express` banner is stripped so the stack isn't advertised,
and TLS is enforced end-to-end via Azure App Service managed certificates.

**Content-Security-Policy is intentionally deferred.** The operator console
relies on inline scripts and dynamically generated effects (the lightcycle
arena, matrix rain, live canvases), so a strict CSP is being authored
deliberately rather than dropped in blind — tracked as a follow-up alongside
`Permissions-Policy` and `Cross-Origin-Embedder-Policy`.

Posture is verified externally with `nuclei` and securityheaders.com against
the live endpoint.
---

## Local development

```bash
git clone https://github.com/CygnusWildstar/neo99-grid.git
cd neo99-grid
npm ci
npm start
# open http://localhost:3000
```

Required: **Node.js 22 LTS**. Older versions will fail (the `package.json`
`engines` field enforces this).

---

## Deploying your own

The GitHub Actions workflow (`.github/workflows/azure-deploy.yml`) expects
these secrets in your repo:

| Secret                  | Value                                |
| ----------------------- | ------------------------------------ |
| `AZURE_CLIENT_ID`       | Service principal app ID             |
| `AZURE_CLIENT_SECRET`   | Service principal password           |
| `AZURE_TENANT_ID`       | Azure AD tenant GUID                 |
| `AZURE_SUBSCRIPTION_ID` | Subscription GUID                    |
| `AZURE_WEBAPP_NAME`     | Web App resource name                |

The service principal is scoped to the Resource Group only — least
privilege. The workflow logs into Azure, deploys the package, sets two
metadata App Settings (`GIT_COMMIT_SHA`, `DEPLOY_TIME`) so the running
container can surface its own deployment info, then logs out.

---

## Status

🟦 **Production.** Live since May 2026. Continuously deployed.

---

## Easter eggs

There are a few. Watch the commands. Watch the `motd`. Watch the boot
sequence. Some are *TRON*. Some are *Star Blazers / Space Battleship
Yamato*. Some are older still.

---

## Operator

**CygnusWildstar** · [github.com/CygnusWildstar](https://github.com/CygnusWildstar) · [neo99.com](https://neo99.com)

---

_End of line._ ◢◣
