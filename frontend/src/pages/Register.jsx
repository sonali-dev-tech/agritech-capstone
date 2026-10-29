import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axios';
import { ErrorAlert } from '../components/Feedback';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await register(form); navigate('/dashboard'); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <h3 className="mb-3">Farmer Registration</h3>
          <ErrorAlert message={error} />
          <form onSubmit={submit}>
            <input className="form-control mb-3" placeholder="Full name" required value={form.name} onChange={set('name')} />
            <input className="form-control mb-3" type="email" placeholder="Email" required value={form.email} onChange={set('email')} />
            <input className="form-control mb-3" type="password" placeholder="Password (min 6 chars)" minLength={6} required value={form.password} onChange={set('password')} />
            <div className="row">
              <div className="col"><input className="form-control mb-3" placeholder="Phone" value={form.phone} onChange={set('phone')} /></div>
              <div className="col"><input className="form-control mb-3" placeholder="Village / District" value={form.location} onChange={set('location')} /></div>
            </div>
            <button className="btn btn-success w-100">Register</button>
          </form>
          <p className="mt-3 mb-0 small">Already registered? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
