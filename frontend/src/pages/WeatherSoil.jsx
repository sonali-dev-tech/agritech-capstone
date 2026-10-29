import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/axios';
import { Loader, ErrorAlert } from '../components/Feedback';

const icon = { Sunny: '☀️', 'Partly Cloudy': '⛅', Cloudy: '☁️', 'Light Rain': '🌦️', 'Heavy Rain': '🌧️', Thunderstorm: '⛈️' };

function soilReport(s) {
  const r = [];
  if (s.ph < 6) r.push({ t: 'warning', m: `Soil is acidic (pH ${s.ph}). Apply agricultural lime.` });
  else if (s.ph > 7.5) r.push({ t: 'warning', m: `Soil is alkaline (pH ${s.ph}). Add gypsum, sulphur or organic compost.` });
  else r.push({ t: 'success', m: `pH ${s.ph} is in the ideal range.` });
  if (s.nitrogen < 40) r.push({ t: 'warning', m: 'Low nitrogen: apply urea or well-rotted farmyard manure.' });
  if (s.phosphorus < 25) r.push({ t: 'warning', m: 'Low phosphorus: apply DAP or single super phosphate.' });
  if (s.potassium < 120) r.push({ t: 'warning', m: 'Low potassium: apply muriate of potash.' });
  if (s.moisture < 25) r.push({ t: 'danger', m: 'Soil moisture is low: schedule irrigation.' });
  else if (s.moisture > 70) r.push({ t: 'info', m: 'Soil is very wet: improve drainage.' });
  if (s.organicCarbon < 0.5) r.push({ t: 'warning', m: 'Low organic carbon: add compost or green manure.' });
  return r;
}

export default function WeatherSoil() {
  const [farms, setFarms] = useState(null);
  const [sel, setSel] = useState('');
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/farms').then((r) => {
      setFarms(r.data);
      if (r.data[0]) { setSel(r.data[0]._id); setLocation(r.data[0].location.district); }
    }).catch((e) => setError(errMsg(e)));
  }, []);

  useEffect(() => {
    if (!location) return;
    setWeather(null);
    api.get('/weather', { params: { location } }).then((r) => setWeather(r.data)).catch((e) => setError(errMsg(e)));
  }, [location]);

  const farm = farms?.find((f) => f._id === sel);
  if (!farms) return <Loader />;

  return (
    <>
      <h3>Weather & Soil Reports</h3>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <select className="form-select" value={sel} onChange={(e) => { setSel(e.target.value); setLocation(farms.find((f) => f._id === e.target.value).location.district); }}>
            {farms.length === 0 && <option>No farms – add one first</option>}
            {farms.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}</select>
        </div>
        <div className="col-md-4">
          <input className="form-control" placeholder="Or search a location" onKeyDown={(e) => e.key === 'Enter' && e.target.value && setLocation(e.target.value)} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card"><div className="card-body">
            <h5>Weather – <span className="text-capitalize">{location || '—'}</span> <span className="badge bg-secondary">simulated</span></h5>
            {!weather ? <Loader /> : (
              <>
                <div className="d-flex align-items-center mb-3">
                  <div className="display-4 me-3">{icon[weather.current.condition]}</div>
                  <div><h2 className="mb-0">{weather.current.temperature}°C</h2><div>{weather.current.condition}</div>
                    <small className="text-muted">Humidity {weather.current.humidity}% · Wind {weather.current.windSpeed} km/h · Rain {weather.current.rainfallChance}%</small></div>
                </div>
                {weather.advisory.map((a, i) => <div key={i} className="alert alert-info py-2 small mb-2">🌱 {a}</div>)}
                <div className="table-responsive"><table className="table table-sm mt-2 mb-0">
                  <thead><tr><th>Date</th><th></th><th>Min/Max</th><th>Rain</th></tr></thead>
                  <tbody>{weather.forecast.map((f) => (
                    <tr key={f.date}><td>{new Date(f.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td>{icon[f.condition]} {f.condition}</td><td>{f.minTemp}° / {f.maxTemp}°</td><td>{f.rainfallChance}%</td></tr>))}</tbody>
                </table></div>
              </>
            )}
          </div></div>
        </div>
        <div className="col-lg-5">
          <div className="card"><div className="card-body">
            <h5>Soil Health Report</h5>
            {!farm ? <p className="text-muted">Select a farm.</p> : (
              <>
                <table className="table table-sm"><tbody>
                  {[['Soil type', farm.soil.type], ['pH', farm.soil.ph], ['Nitrogen', `${farm.soil.nitrogen} kg/ha`], ['Phosphorus', `${farm.soil.phosphorus} kg/ha`],
                    ['Potassium', `${farm.soil.potassium} kg/ha`], ['Moisture', `${farm.soil.moisture}%`], ['Organic carbon', `${farm.soil.organicCarbon}%`],
                    ['Last tested', new Date(farm.soil.lastTested).toLocaleDateString()]].map(([k, v]) => <tr key={k}><td>{k}</td><td className="fw-bold">{v}</td></tr>)}
                </tbody></table>
                {soilReport(farm.soil).map((r, i) => <div key={i} className={`alert alert-${r.t} py-2 small mb-2`}>{r.m}</div>)}
              </>
            )}
          </div></div>
        </div>
      </div>
    </>
  );
}
