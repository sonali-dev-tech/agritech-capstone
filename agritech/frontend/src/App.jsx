import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Farms from './pages/Farms';
import CropMonitoring from './pages/CropMonitoring';
import WeatherSoil from './pages/WeatherSoil';
import Marketplace from './pages/Marketplace';
import Orders from './pages/Orders';

const Home = () => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'Admin' ? '/admin' : '/dashboard'} replace />;
  return (
    <div className="container py-5 text-center">
      <h1 className="display-5 fw-bold text-success">AgriTech</h1>
      <p className="lead">Empowering farmers through digital technology</p>
      <p className="text-muted">Monitor crops, track weather and soil health, and buy farm resources — all in one place.</p>
      <a href="/register" className="btn btn-success me-2">Get Started</a>
      <a href="/login" className="btn btn-outline-success">Login</a>
    </div>
  );
};

const F = ({ children }) => <ProtectedRoute roles={['Farmer']}>{children}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <NavBar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<F><FarmerDashboard /></F>} />
          <Route path="/farms" element={<F><Farms /></F>} />
          <Route path="/crops" element={<F><CropMonitoring /></F>} />
          <Route path="/weather" element={<F><WeatherSoil /></F>} />
          <Route path="/marketplace" element={<F><Marketplace /></F>} />
          <Route path="/orders" element={<F><Orders /></F>} />
          <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
