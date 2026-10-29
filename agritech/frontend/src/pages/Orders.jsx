import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/axios';
import { Loader, ErrorAlert, statusColor } from '../components/Feedback';

const STEPS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get('/orders/my').then((r) => setOrders(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);
  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try { await api.patch(`/orders/${id}/cancel`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h3>Order Tracking</h3>
      <ErrorAlert message={error} onClose={() => setError('')} />
      {!orders ? <Loader /> : orders.length === 0 ? <p className="text-muted">No orders yet.</p> : orders.map((o) => {
        const idx = STEPS.indexOf(o.status);
        return (
          <div className="card mb-3" key={o._id}><div className="card-body">
            <div className="d-flex justify-content-between flex-wrap">
              <div><strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
                <div className="small text-muted">{new Date(o.createdAt).toLocaleString()} · {o.paymentMethod}</div></div>
              <span className={`badge bg-${statusColor(o.status)} align-self-start`}>{o.status}</span>
            </div>
            <ul className="small my-2">{o.items.map((i) => <li key={i._id}>{i.name} × {i.quantity} — ₹{i.price * i.quantity}</li>)}</ul>
            <div className="fw-bold mb-2">Total: ₹{o.totalAmount}</div>
            {o.status === 'Cancelled' ? <div className="text-danger small">This order was cancelled.</div> : (
              <div className="d-flex justify-content-between text-center small">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-fill">
                    <div className={`rounded-circle mx-auto mb-1 ${i <= idx ? 'bg-success' : 'bg-secondary-subtle'}`} style={{ width: 18, height: 18 }} />
                    <span className={i <= idx ? 'fw-bold' : 'text-muted'}>{s}</span>
                  </div>))}
              </div>
            )}
            {o.status === 'Placed' && <button className="btn btn-sm btn-outline-danger mt-3" onClick={() => cancel(o._id)}>Cancel order</button>}
          </div></div>
        );
      })}
    </>
  );
}
