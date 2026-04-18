import { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, clearToken } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [role, setRole]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('gg_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user);
        setRole(parsed.role);
      } catch {}
    }
    setLoading(false);
  }, []);

  const saveAuth = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('gg_auth', JSON.stringify({ user: userData, role: userRole }));
  };

  // ── STUDENT ──────────────────────────────────────────────────
  const loginStudent = async (email, password) => {
    try {
      const data = await api.post('/auth/student/login', { email, password });
      setToken(data.token);
      const userData = { ...data.user, role: 'student' };
      saveAuth(userData, 'student');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const registerStudent = async (formData) => {
    try {
      const data = await api.post('/auth/student/register', {
        name:          formData.name,
        email:         formData.email,
        password:      formData.password,
        roll_number:   formData.rollNumber,
        department:    formData.department,
        year_of_study: parseInt(formData.yearOfStudy),
      });
      setToken(data.token);
      const userData = {
        student_id:    data.student_id,
        name:          data.name,
        email:         data.email,
        roll_number:   formData.rollNumber,
        department:    formData.department,
        year_of_study: parseInt(formData.yearOfStudy),
        loyalty_points: data.loyalty_points,
        wallet_balance: 500,
        role: 'student',
      };
      saveAuth(userData, 'student');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ── VENDOR ───────────────────────────────────────────────────
  const loginVendor = async (email, password) => {
    try {
      const data = await api.post('/auth/vendor/login', { email, password });
      setToken(data.token);
      const userData = { ...data.user, role: 'vendor' };
      saveAuth(userData, 'vendor');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ── ADMIN ────────────────────────────────────────────────────
  const loginAdmin = async (email, password) => {
    try {
      const data = await api.post('/auth/admin/login', { email, password });
      setToken(data.token);
      const userData = { ...data.user, role: 'admin' };
      saveAuth(userData, 'admin');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    clearToken();
    localStorage.removeItem('gg_auth');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('gg_auth', JSON.stringify({ user: updated, role }));
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, loginStudent, registerStudent, loginVendor, loginAdmin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
