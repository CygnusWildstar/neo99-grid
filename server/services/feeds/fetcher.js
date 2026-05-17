// ==========================================================
//  NEO99 :: GRID — Feed Fetcher
//
//  Pulls a single source and returns a normalized array of
//  feed items. Handles both RSS and Hacker News's JSON API.
// ==========================================================

import Parser from 'rss-parser';
import { FETCH_TIMEOUT_MS } from './sources.js';

const rssParser = new Parser({
    timeout: FETCH_TIMEOUT_MS,
    headers: {
        'User-Agent': 'Neo99Grid/0.4 (+https://neo99.com)',
    },
});

// ---- Normalized item shape ----
//   { id, title, url, source, sourceId, publishedAt, summary }
//
// We always produce this shape regardless of input format,
// so the frontend / API don't care if it came from RSS or HN.

// ---- HN: fetch top story IDs, then look up each item ----
async function fetchHackerNews(source) {
    const idsRes = await fetch(`${source.endpoint}/${source.topStories}.json`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!idsRes.ok) throw new Error(`HN top: HTTP ${idsRes.status}`);
    const ids = await idsRes.json();
    const topIds = ids.slice(0, source.maxItems);

    // Fetch each story in parallel
    const stories = await Promise.all(topIds.map(async (id) => {
        const r = await fetch(`${source.endpoint}/item/${id}.json`, {
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!r.ok) return null;
        return r.json();
    }));

    return stories
        .filter(s => s && s.title)
        .map(s => ({
            id:          `hn-${s.id}`,
            title:       s.title,
            url:         s.url || `https://news.ycombinator.com/item?id=${s.id}`,
            source:      source.label,
            sourceId:    source.id,
            publishedAt: new Date(s.time * 1000).toISOString(),
            summary:     s.url ? new URL(s.url).hostname : 'news.ycombinator.com',
        }));
}

// ---- Generic RSS fetch ----
async function fetchRSS(source) {
    const feed = await rssParser.parseURL(source.url);
    const items = (feed.items || []).slice(0, source.maxItems);

    return items
        .filter(it => it.title)
        .map((it, idx) => {
            // Best-effort published-at parsing
            const pubDate = it.isoDate || it.pubDate || null;
            const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();

            // Stable-ish ID — use the GUID if present, otherwise hash-ish from link+title
            const id = it.guid || it.id || `${source.id}-${idx}-${it.link || it.title}`;

            return {
                id:          `${source.id}-${id}`,
                title:       (it.title || '').trim(),
                url:         it.link || '',
                source:      source.label,
                sourceId:    source.id,
                publishedAt,
                summary:     (it.contentSnippet || it.summary || '').slice(0, 240).trim(),
            };
        });
}

// ---- Dispatcher ----
export async function fetchSource(source) {
    switch (source.kind) {
        case 'firebase': return fetchHackerNews(source);
        case 'rss':      return fetchRSS(source);
        default:
            throw new Error(`unknown source kind: ${source.kind}`);
    }
}