import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axios';
import { ErrorAlert } from '../components/Feedback';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === 'Admin' ? '/admin' : '/dashboard');
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card p-4">
          <h3 className="mb-3">Login</h3>
          <ErrorAlert message={error} />
          <form onSubmit={submit}>
            <input className="form-control mb-3" type="email" placeholder="Email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-control mb-3" type="password" placeholder="Password" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="btn btn-success w-100">Login</button>
          </form>
          <p className="mt-3 mb-0 small">New farmer? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
