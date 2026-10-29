import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const link = ({ isActive }) => 'nav-link' + (isActive ? ' active fw-bold' : '');
  const farmer = [['/dashboard', 'Dashboard'], ['/farms', 'My Farms'], ['/crops', 'Crop Monitoring'],
    ['/weather', 'Weather & Soil'], ['/marketplace', 'Marketplace'], ['/orders', 'My Orders']];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-agri">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🌾 AgriTech</Link>
        <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {user?.role === 'Farmer' && farmer.map(([to, label]) => (
              <li className="nav-item" key={to}><NavLink className={link} to={to}>{label}</NavLink></li>))}
            {user?.role === 'Admin' && (
              <li className="nav-item"><NavLink className={link} to="/admin">Admin Dashboard</NavLink></li>)}
          </ul>
          <ul className="navbar-nav align-items-lg-center">
            {user ? (
              <>
                <li className="nav-item text-white me-3 small">{user.name} <span className="badge bg-light text-success">{user.role}</span></li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-light" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className={link} to="/login">Login</NavLink></li>
                <li className="nav-item"><NavLink className={link} to="/register">Register</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
