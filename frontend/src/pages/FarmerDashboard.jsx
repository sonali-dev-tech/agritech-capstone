import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Loader, ErrorAlert, StatCard, statusColor } from '../components/Feedback';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/farms'), api.get('/crops'), api.get('/orders/my')])
      .then(([f, c, o]) => setData({ farms: f.data, crops: c.data, orders: o.data })).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorAlert message={error} />;
  if (!data) return <Loader />;
  const { farms, crops, orders } = data;
  const alerts = crops.flatMap((c) => c.pestAlerts.filter((a) => !a.resolved).map((a) => ({ ...a, crop: c.name })));
  const avg = crops.length ? Math.round(crops.reduce((s, c) => s + c.health.score, 0) / crops.length) : 0;

  return (
    <>
      <h3>Welcome, {user.name} 👋</h3>
      <div className="row g-3 my-2">
        <StatCard label="Farms" value={farms.length} />
        <StatCard label="Crops" value={crops.length} color="primary" />
        <StatCard label="Avg crop health" value={`${avg}%`} color="info" />
        <StatCard label="Open pest alerts" value={alerts.length} color={alerts.length ? 'danger' : 'success'} />
      </div>
      <div className="row g-3">
        <div className="col-md-6"><div className="card h-100"><div className="card-body">
          <h5>Pest alerts</h5>
          {alerts.length === 0 ? <p className="text-muted small">No active alerts 🎉</p> :
            alerts.map((a) => <div key={a._id} className="small mb-1"><span className="badge bg-danger me-1">{a.severity}</span>{a.crop}: {a.pest}</div>)}
          <Link to="/crops" className="btn btn-sm btn-outline-success mt-2">Crop monitoring</Link>
        </div></div></div>
        <div className="col-md-6"><div className="card h-100"><div className="card-body">
          <h5>Recent orders</h5>
          {orders.length === 0 ? <p className="text-muted small">No orders yet.</p> :
            orders.slice(0, 4).map((o) => (
              <div key={o._id} className="d-flex justify-content-between small mb-1">
                <span>#{o._id.slice(-6).toUpperCase()} · ₹{o.totalAmount}</span><span className={`badge bg-${statusColor(o.status)}`}>{o.status}</span></div>))}
          <Link to="/marketplace" className="btn btn-sm btn-success mt-2 me-2">Shop resources</Link>
          <Link to="/weather" className="btn btn-sm btn-outline-success mt-2">Weather & soil</Link>
        </div></div></div>
      </div>
    </>
  );
}
