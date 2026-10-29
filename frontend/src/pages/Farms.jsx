import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/axios';
import { Loader, ErrorAlert } from '../components/Feedback';

const empty = { name: '', areaAcres: '', district: '', state: '', village: '', soilType: 'Loamy', ph: 6.5, nitrogen: 50, phosphorus: 30, potassium: 150, moisture: 35, organicCarbon: 0.6 };

export default function Farms() {
  const [farms, setFarms] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => api.get('/farms').then((r) => setFarms(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/farms', {
        name: form.name, areaAcres: Number(form.areaAcres),
        location: { district: form.district, state: form.state, village: form.village },
        soil: { type: form.soilType, ph: +form.ph, nitrogen: +form.nitrogen, phosphorus: +form.phosphorus,
          potassium: +form.potassium, moisture: +form.moisture, organicCarbon: +form.organicCarbon },
      });
      setForm(empty); setError(''); load();
    } catch (err) { setError(errMsg(err)); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this farm and all its crops?')) return;
    try { await api.delete(`/farms/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  const num = (k, label, step = 'any') => (
    <div className="col-6 col-md-2"><label className="form-label small">{label}</label>
      <input type="number" step={step} className="form-control" value={form[k]} onChange={set(k)} /></div>
  );

  return (
    <>
      <h3>My Farms</h3>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <div className="card mb-4"><div className="card-body">
        <h6>Add a farm</h6>
        <form onSubmit={submit} className="row g-2">
          <div className="col-md-4"><input className="form-control" placeholder="Farm name" required value={form.name} onChange={set('name')} /></div>
          <div className="col-md-2"><input className="form-control" type="number" placeholder="Acres" required value={form.areaAcres} onChange={set('areaAcres')} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="Village" value={form.village} onChange={set('village')} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="District *" required value={form.district} onChange={set('district')} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="State" value={form.state} onChange={set('state')} /></div>
          <div className="col-12"><hr className="my-2" /><small className="text-muted">Soil test results</small></div>
          <div className="col-6 col-md-2"><label className="form-label small">Soil type</label>
            <select className="form-select" value={form.soilType} onChange={set('soilType')}>
              {['Loamy', 'Sandy', 'Clay', 'Black cotton', 'Red', 'Alluvial'].map((s) => <option key={s}>{s}</option>)}
            </select></div>
          {num('ph', 'pH', '0.1')}{num('nitrogen', 'N (kg/ha)')}{num('phosphorus', 'P (kg/ha)')}{num('potassium', 'K (kg/ha)')}{num('moisture', 'Moisture %')}
          <div className="col-12"><button className="btn btn-success">Add Farm</button></div>
        </form>
      </div></div>

      {!farms ? <Loader /> : farms.length === 0 ? <p className="text-muted">No farms yet.</p> : (
        <div className="row g-3">
          {farms.map((f) => (
            <div className="col-md-6" key={f._id}><div className="card h-100"><div className="card-body">
              <div className="d-flex justify-content-between">
                <h5>{f.name}</h5>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(f._id)}>Delete</button>
              </div>
              <p className="text-muted mb-1">{[f.location.village, f.location.district, f.location.state].filter(Boolean).join(', ')} · {f.areaAcres} acres</p>
              <small>Soil: {f.soil.type}, pH {f.soil.ph}, N {f.soil.nitrogen}, P {f.soil.phosphorus}, K {f.soil.potassium}</small>
            </div></div></div>
          ))}
        </div>
      )}
    </>
  );
}
