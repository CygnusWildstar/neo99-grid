// ==========================================================
//  weather — real weather via Open-Meteo
//
//  Usage: weather <city>
//  Examples: weather Miami, weather "Mexico City", weather Tokyo
//
//  Two-step lookup:
//    1. Geocode the city name → lat/lng
//    2. Pull current weather + 3-day forecast for those coords
//
//  Open-Meteo is free and requires no API key.
//
//  Layout note: the weather glyphs render at different widths
//  in different fonts, so every fixed-width column (day, temps)
//  comes BEFORE the glyph and the description goes last.
//  Sized to fit the docked ~50-column terminal.
// ==========================================================

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Map WMO weather codes to glyphs + short labels
// https://open-meteo.com/en/docs (search WMO Weather interpretation codes)
const WX_CODES = {
    0:  ['☀',  'clear sky'],
    1:  ['🌤', 'mainly clear'],
    2:  ['⛅', 'partly cloudy'],
    3:  ['☁',  'overcast'],
    45: ['🌫', 'fog'],
    48: ['🌫', 'rime fog'],
    51: ['🌦', 'light drizzle'],
    53: ['🌦', 'drizzle'],
    55: ['🌧', 'heavy drizzle'],
    61: ['🌦', 'light rain'],
    63: ['🌧', 'rain'],
    65: ['🌧', 'heavy rain'],
    71: ['🌨', 'light snow'],
    73: ['🌨', 'snow'],
    75: ['❄',  'heavy snow'],
    77: ['❄',  'snow grains'],
    80: ['🌦', 'light showers'],
    81: ['🌧', 'rain showers'],
    82: ['🌧', 'violent showers'],
    95: ['⛈', 'thunderstorm'],
    96: ['⛈', 't-storm + hail'],
    99: ['⛈', 'severe t-storm + hail'],
};

function wxLabel(code) {
    const e = WX_CODES[code];
    return e ? `${e[0]} ${e[1]}` : `code ${code}`;
}

// "2026-10-17" → "Sat"
function weekday(isoDate) {
    return new Date(`${isoDate}T12:00:00Z`)
        .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export default {
    name: 'weather',
    description: 'real weather for a city (usage: weather <city>)',

    async run({ args }) {
        const lines = [{ text: '' }];

        if (!args || args.length === 0) {
            lines.push({ text: '  usage: weather <city>', color: 'dim' });
            lines.push({ text: '  e.g.   weather Miami', color: 'dim' });
            lines.push({ text: '         weather Mexico City', color: 'dim' });
            lines.push({ text: '' });
            return { lines };
        }

        const city = args.join(' ');

        // ---- 1. Geocode ----
        const geoUrl = `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1&format=json`;
        const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(8000) });
        if (!geoRes.ok) {
            lines.push({ text: `  geocode failed: HTTP ${geoRes.status}`, color: 'red' });
            return { lines };
        }
        const geo = await geoRes.json();
        if (!geo.results || geo.results.length === 0) {
            lines.push({ text: `  no location found for "${city}"`, color: 'red' });
            return { lines };
        }
        const place = geo.results[0];
        const { latitude, longitude, name, country, admin1, timezone } = place;

        // ---- 2. Weather ----
        const wxUrl = `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}`
            + `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
            + `&daily=weather_code,temperature_2m_max,temperature_2m_min`
            + `&temperature_unit=fahrenheit&wind_speed_unit=mph`
            + `&timezone=${encodeURIComponent(timezone || 'auto')}&forecast_days=4`;

        const wxRes = await fetch(wxUrl, { signal: AbortSignal.timeout(8000) });
        if (!wxRes.ok) {
            lines.push({ text: `  weather failed: HTTP ${wxRes.status}`, color: 'red' });
            return { lines };
        }
        const wx = await wxRes.json();
        const c = wx.current;
        const d = wx.daily;

        // ---- Render ----
        const locStr = [name, admin1, country].filter(Boolean).join(', ');
        lines.push({ text: `  ▸ ${locStr}`, color: 'cyanBright' });
        lines.push({ text: `    ${latitude.toFixed(3)}, ${longitude.toFixed(3)} · ${timezone}`, color: 'dim' });
        lines.push({ text: '' });

        const nowTemp = `${Math.round(c.temperature_2m)}°F`.padEnd(6);
        lines.push({ text: `  NOW   ${nowTemp}  ${wxLabel(c.weather_code)}`, color: 'greenBright' });
        lines.push({ text: `        humidity ${c.relative_humidity_2m}% · wind ${Math.round(c.wind_speed_10m)} mph`, color: 'cyan' });
        lines.push({ text: '' });
        lines.push({ text: '  FORECAST    hi / lo', color: 'cyanBright' });

        for (let i = 0; i < Math.min(4, d.time.length); i++) {
            const label = (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekday(d.time[i])).padEnd(10);
            const hi = Math.round(d.temperature_2m_max[i]);
            const lo = Math.round(d.temperature_2m_min[i]);
            const temps = `${hi}° / ${lo}°`.padEnd(11);
            lines.push({ text: `    ${label}${temps} ${wxLabel(d.weather_code[i])}`, color: 'cyan' });
        }

        lines.push({ text: '' });
        return { lines };
    },
};