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
// ==========================================================

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Map WMO weather codes to glyphs + labels
// https://open-meteo.com/en/docs (search WMO Weather interpretation codes)
const WX_CODES = {
    0:  ['☀',  'clear sky'],
    1:  ['🌤', 'mainly clear'],
    2:  ['⛅', 'partly cloudy'],
    3:  ['☁',  'overcast'],
    45: ['🌫', 'fog'],
    48: ['🌫', 'depositing rime fog'],
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
    80: ['🌦', 'light rain showers'],
    81: ['🌧', 'rain showers'],
    82: ['🌧', 'violent rain showers'],
    95: ['⛈', 'thunderstorm'],
    96: ['⛈', 'thunderstorm w/ hail'],
    99: ['⛈', 'severe thunderstorm w/ hail'],
};

function wxLabel(code) {
    const e = WX_CODES[code];
    return e ? `${e[0]}  ${e[1]}` : `code ${code}`;
}

export default {
    name: 'weather',
    description: 'real weather for a city (usage: weather <city>)',

    async run({ args }) {
        const lines = [{ text: '' }];

        if (!args || args.length === 0) {
            lines.push({ text: '  usage: weather <city>', color: 'dim' });
            lines.push({ text: '  examples: weather Miami, weather Tokyo, weather "London"', color: 'dim' });
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
        lines.push({ text: `    ${latitude.toFixed(3)}, ${longitude.toFixed(3)}  ·  ${timezone}`, color: 'dim' });
        lines.push({ text: '' });
        lines.push({ text: `  NOW   ${wxLabel(c.weather_code).padEnd(28)} ${Math.round(c.temperature_2m)}°F`, color: 'green' });
        lines.push({ text: `        humidity ${c.relative_humidity_2m}%   wind ${Math.round(c.wind_speed_10m)} mph`, color: 'cyan' });
        lines.push({ text: '' });
        lines.push({ text: '  FORECAST', color: 'cyanBright' });

        const dayNames = ['Today', 'Tomorrow', 'Day +2', 'Day +3'];
        for (let i = 0; i < Math.min(4, d.time.length); i++) {
            const label = dayNames[i].padEnd(10);
            const wxStr = wxLabel(d.weather_code[i]).padEnd(28);
            const hi = Math.round(d.temperature_2m_max[i]);
            const lo = Math.round(d.temperature_2m_min[i]);
            lines.push({ text: `    ${label} ${wxStr} ${hi}° / ${lo}°`, color: 'cyan' });
        }

        lines.push({ text: '' });
        return { lines };
    },
};