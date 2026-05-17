// ==========================================================
//  NEO99 :: GRID — Feed Sources Configuration
//
//  Each entry describes one feed source. The fetcher uses
//  this to know what to pull, how often, and how to label it.
//  Adding a new source = adding one entry here. No code
//  changes needed elsewhere.
// ==========================================================

export const sources = [
    {
        id:         'hackernews',
        label:      'Hacker News',
        kind:       'firebase',                                       // special: uses HN's JSON API, not RSS
        endpoint:   'https://hacker-news.firebaseio.com/v0',
        topStories: 'topstories',
        maxItems:   8,
    },
    {
        id:       'arstechnica',
        label:    'Ars Technica',
        kind:     'rss',
        url:      'https://feeds.arstechnica.com/arstechnica/index',
        maxItems: 5,
    },
    {
        id:       'theverge',
        label:    'The Verge',
        kind:     'rss',
        url:      'https://www.theverge.com/rss/index.xml',
        maxItems: 5,
    },
    {
        id:       'azure',
        label:    'Microsoft Azure',
        kind:     'rss',
        url:      'https://azure.microsoft.com/en-us/blog/feed/',
        maxItems: 5,
    },
    {
        id:       'azurestatus',
        label:    'Azure Status',
        kind:     'rss',
        url:      'https://azurestatuscdn.azureedge.net/en-us/status/feed/',
        maxItems: 4,
    },
];

// How often to refresh feeds, in milliseconds.
// Phase 3: 15 minutes. Phase 4 will move this to an Azure Function timer trigger.
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// Per-fetch timeout — never let one slow feed block the others.
export const FETCH_TIMEOUT_MS = 10 * 1000;