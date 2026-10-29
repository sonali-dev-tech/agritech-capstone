import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/axios';
import { Loader, ErrorAlert } from '../components/Feedback';

const CATS = ['All', 'Seeds', 'Fertilizer', 'Pesticide', 'Equipment', 'Other'];

export default function Marketplace() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({});
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('COD');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/products', { params: { category: cat === 'All' ? undefined : cat, search: search || undefined } })
        .then((r) => setProducts(r.data)).catch((e) => setError(errMsg(e)));
    }, 250);
    return () => clearTimeout(t);
  }, [cat, search]);

  const add = (p) => setCart((c) => ({ ...c, [p._id]: { p, qty: Math.min((c[p._id]?.qty || 0) + 1, p.stock) } }));
  const setQty = (id, qty) => setCart((c) => {
    const n = { ...c };
    if (qty < 1) delete n[id]; else n[id] = { ...n[id], qty: Math.min(qty, n[id].p.stock) };
    return n;
  });
  const lines = Object.values(cart);
  const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0);

  const checkout = async () => {
    try {
      await api.post('/orders', { items: lines.map((l) => ({ productId: l.p._id, quantity: l.qty })), shippingAddress: address, paymentMethod: payment });
      navigate('/orders');
    } catch (e) { setError(errMsg(e)); }
  };

  return (
    <>
      <h3>Marketplace</h3>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <input className="form-control w-auto" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            {CATS.map((c) => <button key={c} className={`btn btn-sm ${cat === c ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          {!products ? <Loader /> : products.length === 0 ? <p className="text-muted">No products found.</p> : (
            <div className="row g-3">
              {products.map((p) => (
                <div className="col-sm-6" key={p._id}><div className="card h-100"><div className="card-body">
                  <span className="badge bg-light text-success border mb-1">{p.category}</span>
                  <h6>{p.name}</h6><p className="small text-muted mb-1">{p.description}</p>
                  <div className="fw-bold">₹{p.price} <small className="text-muted">/ {p.unit}</small></div>
                  <small className={p.stock < 10 ? 'text-danger' : 'text-muted'}>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</small>
                  <button className="btn btn-sm btn-success d-block mt-2" disabled={p.stock < 1} onClick={() => add(p)}>Add to cart</button>
                </div></div></div>
              ))}
            </div>
          )}
        </div>
        <div className="col-lg-4">
          <div className="card"><div className="card-body">
            <h5>Cart</h5>
            {lines.length === 0 ? <p className="text-muted small">Your cart is empty.</p> : (
              <>
                {lines.map(({ p, qty }) => (
                  <div key={p._id} className="d-flex justify-content-between align-items-center mb-2 small">
                    <span>{p.name}</span>
                    <span className="d-flex align-items-center gap-1">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setQty(p._id, qty - 1)}>−</button>{qty}
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setQty(p._id, qty + 1)}>+</button>
                    </span>
                    <span>₹{p.price * qty}</span>
                  </div>
                ))}
                <hr /><div className="d-flex justify-content-between fw-bold mb-2"><span>Total</span><span>₹{total}</span></div>
                <textarea className="form-control mb-2" rows="2" placeholder="Shipping address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <select className="form-select mb-2" value={payment} onChange={(e) => setPayment(e.target.value)}>
                  <option value="COD">Cash on Delivery</option><option value="UPI">UPI</option><option value="Card">Card</option></select>
                <button className="btn btn-success w-100" disabled={!address.trim()} onClick={checkout}>Place Order</button>
              </>
            )}
          </div></div>
        </div>
      </div>
    </>
  );
}
