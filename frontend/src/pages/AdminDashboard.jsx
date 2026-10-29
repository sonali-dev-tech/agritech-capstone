import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/axios';
import { Loader, ErrorAlert, StatCard, statusColor } from '../components/Feedback';

const NEXT = { Placed: 'Confirmed', Confirmed: 'Shipped', Shipped: 'Delivered' };
const blank = { name: '', category: 'Seeds', price: '', unit: 'kg', stock: '', description: '' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [s, u, o, p] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/orders'), api.get('/products')]);
      setStats(s.data); setUsers(u.data); setOrders(o.data); setProducts(p.data);
    } catch (e) { setError(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);
  const run = async (fn) => { try { await fn(); setError(''); load(); } catch (e) { setError(errMsg(e)); } };

  if (!stats) return error ? <ErrorAlert message={error} /> : <Loader />;

  return (
    <>
      <h3>Admin Dashboard</h3>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <ul className="nav nav-pills mb-3">
        {['overview', 'orders', 'products', 'users'].map((t) => (
          <li className="nav-item" key={t}><button className={`nav-link text-capitalize ${tab === t ? 'active bg-success' : 'text-success'}`} onClick={() => setTab(t)}>{t}</button></li>))}
      </ul>

      {tab === 'overview' && (
        <>
          <div className="row g-3 mb-3">
            <StatCard label="Farmers" value={stats.farmers} /><StatCard label="Farms" value={stats.farms} color="primary" />
            <StatCard label="Crops" value={stats.crops} color="info" /><StatCard label="Orders" value={stats.orders} color="warning" />
            <StatCard label="Revenue" value={`₹${stats.revenue}`} /><StatCard label="Products" value={stats.products} color="primary" />
            <StatCard label="Open pest alerts" value={stats.openPestAlerts} color="danger" />
          </div>
          <div className="row g-3">
            <div className="col-md-6"><div className="card"><div className="card-body"><h6>Orders by status</h6>
              {Object.keys(stats.ordersByStatus).length === 0 ? <small className="text-muted">No orders.</small> :
                Object.entries(stats.ordersByStatus).map(([k, v]) => <div key={k} className="mb-1"><span className={`badge bg-${statusColor(k)} me-2`}>{k}</span>{v}</div>)}
            </div></div></div>
            <div className="col-md-6"><div className="card"><div className="card-body"><h6>Low stock (&lt; 10)</h6>
              {stats.lowStock.length === 0 ? <small className="text-muted">All good.</small> :
                stats.lowStock.map((p) => <div key={p._id} className="small">{p.name}: <strong className="text-danger">{p.stock}</strong></div>)}
            </div></div></div>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="table-responsive card"><table className="table align-middle mb-0">
          <thead><tr><th>Order</th><th>Farmer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o._id}><td>#{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name}</td>
              <td className="small">{o.items.map((i) => `${i.name}×${i.quantity}`).join(', ')}</td><td>₹{o.totalAmount}</td>
              <td><span className={`badge bg-${statusColor(o.status)}`}>{o.status}</span></td>
              <td className="text-nowrap">
                {NEXT[o.status] && <button className="btn btn-sm btn-success me-1" onClick={() => run(() => api.patch(`/orders/${o._id}/status`, { status: NEXT[o.status] }))}>Mark {NEXT[o.status]}</button>}
                {NEXT[o.status] && <button className="btn btn-sm btn-outline-danger" onClick={() => run(() => api.patch(`/orders/${o._id}/status`, { status: 'Cancelled' }))}>Cancel</button>}
              </td></tr>))}</tbody>
        </table></div>
      )}

      {tab === 'products' && (
        <>
          <form className="row g-2 mb-3" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post('/products', { ...form, price: +form.price, stock: +form.stock }); setForm(blank); }); }}>
            <div className="col-md-3"><input className="form-control" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="col-md-2"><select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['Seeds', 'Fertilizer', 'Pesticide', 'Equipment', 'Other'].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="col-md-2"><input className="form-control" type="number" placeholder="Price" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div className="col-md-1"><input className="form-control" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div className="col-md-2"><input className="form-control" type="number" placeholder="Stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="col-md-2"><button className="btn btn-success w-100">Add product</button></div>
          </form>
          <div className="table-responsive card"><table className="table align-middle mb-0">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>{products.map((p) => (
              <tr key={p._id}><td>{p.name}</td><td>{p.category}</td><td>₹{p.price}/{p.unit}</td>
                <td><input type="number" className="form-control form-control-sm" style={{ width: 90 }} defaultValue={p.stock}
                  onBlur={(e) => +e.target.value !== p.stock && run(() => api.put(`/products/${p._id}`, { stock: +e.target.value }))} /></td>
                <td><button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('Delete product?') && run(() => api.delete(`/products/${p._id}`))}>Delete</button></td></tr>))}</tbody>
          </table></div>
        </>
      )}

      {tab === 'users' && (
        <div className="table-responsive card"><table className="table align-middle mb-0">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th></th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><span className={`badge bg-${u.role === 'Admin' ? 'dark' : 'success'}`}>{u.role}</span></td><td>{u.location}</td>
              <td>{u.role !== 'Admin' && <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('Delete user and all their data?') && run(() => api.delete(`/admin/users/${u._id}`))}>Delete</button>}</td></tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}
