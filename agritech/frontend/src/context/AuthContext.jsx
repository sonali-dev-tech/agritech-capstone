import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agritech_user')); } catch { return null; }
  });

  const persist = ({ token, user }) => {
    localStorage.setItem('agritech_token', token);
    localStorage.setItem('agritech_user', JSON.stringify(user));
    setUser(user);
    return user;
  };
  const login = async (email, password) => persist((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => persist((await api.post('/auth/register', form)).data);
  const logout = () => {
    localStorage.removeItem('agritech_token');
    localStorage.removeItem('agritech_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
