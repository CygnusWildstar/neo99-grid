// ==========================================================
//  NEO99 :: GRID — Feed panel renderer
//
//  Polls /api/feeds and replaces the hardcoded feed cards
//  on the right side of the UI with live data.
// ==========================================================

(function () {
    'use strict';

    const POLL_MS = 2 * 60 * 1000;       // poll every 2 minutes
    const $pane = document.querySelector('.feed-pane');

    if (!$pane) {
        console.warn('[feeds] .feed-pane not found in DOM');
        return;
    }

    // ---- Loading state ----
    function renderLoading() {
        $pane.innerHTML = `
            <article class="feed-card">
                <header class="card-header">
                    <span class="source">// feeds</span>
                    <span class="count">[ ─ ]</span>
                </header>
                <div class="card-body">
                    <div class="feed-item" style="color: var(--cyan-dim);">
                        connecting to feed service...
                    </div>
                </div>
            </article>
        `;
    }

    function renderError(message) {
        $pane.innerHTML = `
            <article class="feed-card">
                <header class="card-header">
                    <span class="source">// feeds</span>
                    <span class="count">[ ✗ ]</span>
                </header>
                <div class="card-body">
                    <div class="feed-item" style="color: var(--red);">
                        ${escapeHtml(message)}
                    </div>
                </div>
            </article>
        `;
    }

    function relativeTime(isoString) {
        if (!isoString) return '';
        const ms = Date.now() - new Date(isoString).getTime();
        const min = Math.floor(ms / 60000);
        if (min < 1)  return 'just now';
        if (min < 60) return `${min} min ago`;
        const hr = Math.floor(min / 60);
        if (hr < 24)  return `${hr} hr${hr === 1 ? '' : 's'} ago`;
        const d = Math.floor(hr / 24);
        return `${d}d ago`;
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderSources(payload) {
        const cards = payload.sources.map(src => {
            const items = src.items || [];
            const errBadge = src.error ? '<span style="color: var(--red); margin-left: 0.5em;">[ ! ]</span>' : '';

            const itemsHtml = items.length === 0
                ? `<div class="feed-item" style="color: var(--cyan-dim);">${src.error ? 'fetch failed' : 'no items yet'}</div>`
                : items.map(item => `
                    <div class="feed-item" data-url="${escapeHtml(item.url)}">
                        ${escapeHtml(item.title)}
                        <span class="meta">${relativeTime(item.publishedAt)}${item.summary ? ' · ' + escapeHtml(item.summary) : ''}</span>
                    </div>
                `).join('');

            return `
                <article class="feed-card">
                    <header class="card-header">
                        <span class="source">// ${escapeHtml(src.label)}${errBadge}</span>
                        <span class="count">[ ${items.length} ]</span>
                    </header>
                    <div class="card-body">
                        ${itemsHtml}
                    </div>
                </article>
            `;
        });

        $pane.innerHTML = cards.join('');

        // Wire up click → open in new tab
        $pane.querySelectorAll('.feed-item[data-url]').forEach(el => {
            const url = el.getAttribute('data-url');
            if (!url) return;
            el.addEventListener('click', () => {
                window.open(url, '_blank', 'noopener');
            });
        });
    }

    async function poll() {
        try {
            const res = await fetch('/api/feeds');
            if (!res.ok) {
                renderError(`HTTP ${res.status} — server error`);
                return;
            }
            const data = await res.json();
            renderSources(data);
        } catch (err) {
            renderError(err.message);
        }
    }

    // ---- Boot ----
    renderLoading();
    poll();                                  // immediate first poll
    setInterval(poll, POLL_MS);              // then every 2 min
})();