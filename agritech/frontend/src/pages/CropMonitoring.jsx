import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/axios';
import { Loader, ErrorAlert } from '../components/Feedback';

const STAGES = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];
const sev = { Low: 'secondary', Medium: 'warning', High: 'danger' };
const healthColor = (s) => (s >= 75 ? 'success' : s >= 50 ? 'warning' : 'danger');

export default function CropMonitoring() {
  const [crops, setCrops] = useState(null);
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState({ farm: '', name: '', variety: '', expectedHarvest: '' });
  const [alertForm, setAlertForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [c, f] = await Promise.all([api.get('/crops'), api.get('/farms')]);
      setCrops(c.data); setFarms(f.data);
    } catch (e) { setError(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);
  const run = async (fn) => { try { await fn(); setError(''); await load(); } catch (e) { setError(errMsg(e)); } };

  const addCrop = (e) => { e.preventDefault(); run(async () => {
    await api.post('/crops', { ...form, expectedHarvest: form.expectedHarvest || undefined });
    setForm({ farm: '', name: '', variety: '', expectedHarvest: '' });
  }); };
  const updateHealth = (c, patch) => run(() => api.put(`/crops/${c._id}`, patch));
  const addAlert = (id) => run(async () => {
    const a = alertForm[id]; if (!a?.pest) return;
    await api.post(`/crops/${id}/alerts`, a);
    setAlertForm({ ...alertForm, [id]: { pest: '', severity: 'Low', note: '' } });
  });

  return (
    <>
      <h3>Crop Monitoring</h3>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <div className="card mb-4"><div className="card-body">
        <h6>Add a crop</h6>
        {farms.length === 0 && <p className="text-muted small">Add a farm first under "My Farms".</p>}
        <form className="row g-2" onSubmit={addCrop}>
          <div className="col-md-3"><select className="form-select" required value={form.farm} onChange={(e) => setForm({ ...form, farm: e.target.value })}>
            <option value="">Select farm</option>{farms.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}</select></div>
          <div className="col-md-3"><input className="form-control" placeholder="Crop (e.g. Wheat)" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="Variety" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" type="date" title="Expected harvest" value={form.expectedHarvest} onChange={(e) => setForm({ ...form, expectedHarvest: e.target.value })} /></div>
          <div className="col-md-2"><button className="btn btn-success w-100">Add</button></div>
        </form>
      </div></div>

      {!crops ? <Loader /> : crops.length === 0 ? <p className="text-muted">No crops yet.</p> : (
        <div className="row g-3">
          {crops.map((c) => {
            const af = alertForm[c._id] || { pest: '', severity: 'Low', note: '' };
            const open = c.pestAlerts.filter((a) => !a.resolved);
            return (
              <div className="col-lg-6" key={c._id}><div className="card h-100"><div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div><h5 className="mb-0">{c.name} <small className="text-muted">{c.variety}</small></h5>
                    <small className="text-muted">{c.farm?.name}</small></div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('Delete crop?') && run(() => api.delete(`/crops/${c._id}`))}>✕</button>
                </div>
                <label className="small mt-2">Growth stage</label>
                <select className="form-select form-select-sm mb-2" value={c.stage} onChange={(e) => updateHealth(c, { stage: e.target.value })}>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}</select>
                <div className="small">Health score: {c.health.score}%</div>
                <div className="progress mb-2"><div className={`progress-bar bg-${healthColor(c.health.score)}`} style={{ width: `${c.health.score}%` }} /></div>
                <input type="range" className="form-range" min="0" max="100" defaultValue={c.health.score}
                  onMouseUp={(e) => updateHealth(c, { health: { ...c.health, score: +e.target.value } })}
                  onTouchEnd={(e) => updateHealth(c, { health: { ...c.health, score: +e.target.value } })} />
                <div className="small">Growth: {c.health.growthPercent}% · Water: {c.health.waterLevel}%</div>
                <div className="progress mb-3"><div className="progress-bar" style={{ width: `${c.health.growthPercent}%` }} /></div>

                <h6 className="mb-1">Pest alerts {open.length > 0 && <span className="badge bg-danger">{open.length}</span>}</h6>
                {c.pestAlerts.length === 0 && <p className="small text-muted">No alerts.</p>}
                {c.pestAlerts.map((a) => (
                  <div key={a._id} className="d-flex justify-content-between align-items-center border-bottom py-1 small">
                    <span className={a.resolved ? 'text-decoration-line-through text-muted' : ''}>
                      <span className={`badge bg-${sev[a.severity]} me-1`}>{a.severity}</span>{a.pest}{a.note && ` – ${a.note}`}</span>
                    {!a.resolved && <button className="btn btn-sm btn-link" onClick={() => run(() => api.patch(`/crops/${c._id}/alerts/${a._id}/resolve`))}>Resolve</button>}
                  </div>
                ))}
                <div className="input-group input-group-sm mt-2">
                  <input className="form-control" placeholder="Pest / disease" value={af.pest} onChange={(e) => setAlertForm({ ...alertForm, [c._id]: { ...af, pest: e.target.value } })} />
                  <select className="form-select" style={{ maxWidth: 100 }} value={af.severity} onChange={(e) => setAlertForm({ ...alertForm, [c._id]: { ...af, severity: e.target.value } })}>
                    <option>Low</option><option>Medium</option><option>High</option></select>
                  <button className="btn btn-warning" onClick={() => addAlert(c._id)}>Report</button>
                </div>
              </div></div></div>
            );
          })}
        </div>
      )}
    </>
  );
}
