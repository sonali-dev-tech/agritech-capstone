const WeatherData = require('../models/WeatherData');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const CONDITIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm'];
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const rng = (seed) => { let x = seed >>> 0; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); };
const pick = (r, a, b) => Math.round((a + r() * (b - a)) * 10) / 10;

// Deterministic-per-hour simulation so the same location returns stable data within the hour
function simulate(location) {
  const r = rng(hash(location) + Math.floor(Date.now() / 3600000));
  const cond = (rain) => CONDITIONS[Math.min(5, Math.floor(rain / 18))];
  const rain = Math.round(pick(r, 0, 95));
  const current = {
    temperature: pick(r, 18, 40), humidity: Math.round(pick(r, 30, 95)),
    windSpeed: pick(r, 2, 30), rainfallChance: rain, condition: cond(rain),
  };
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); d.setHours(0, 0, 0, 0);
    const rc = Math.round(pick(r, 0, 95)); const min = pick(r, 14, 27);
    return { date: d, minTemp: min, maxTemp: Math.round((min + pick(r, 5, 13)) * 10) / 10, rainfallChance: rc, condition: cond(rc) };
  });
  const advisory = [];
  if (current.rainfallChance > 60 || forecast.slice(0, 2).some((f) => f.rainfallChance > 70)) advisory.push('High rain chance: postpone irrigation and pesticide spraying.');
  if (current.temperature > 35) advisory.push('Heat alert: irrigate early morning or evening and mulch to retain soil moisture.');
  if (current.windSpeed > 22) advisory.push('Strong winds: avoid spraying and support tall crops.');
  if (current.humidity > 85) advisory.push('High humidity: watch for fungal diseases and blight.');
  if (!advisory.length) advisory.push('Conditions are favourable for regular field operations.');
  return { current, forecast, advisory };
}

exports.getWeather = asyncHandler(async (req, res) => {
  const location = (req.query.location || '').trim().toLowerCase();
  if (!location) throw httpError(res, 400, 'location query parameter is required');
  const fresh = await WeatherData.findOne({ location, updatedAt: { $gte: new Date(Date.now() - 3600000) } });
  if (fresh) return res.json(fresh);
  const data = simulate(location);
  const doc = await WeatherData.findOneAndUpdate({ location }, { location, ...data, simulated: true },
    { upsert: true, new: true, setDefaultsOnInsert: true });
  res.json(doc);
});

exports.getHistory = asyncHandler(async (req, res) => res.json(await WeatherData.find().sort('-updatedAt').limit(50)));
