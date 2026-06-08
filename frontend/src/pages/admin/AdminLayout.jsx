import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Store, AlertCircle, RotateCcw, BarChart2, Star, LogOut, Sun, Moon, Menu, Shield, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/canteens', icon: Store, label: 'Canteens' },
  { to: '/admin/grievances', icon: AlertCircle, label: 'Grievances' },
  { to: '/admin/refunds', icon: RotateCcw, label: 'Refunds' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/bulk-orders', icon: Package, label: 'Bulk Orders' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-navy-900' : 'bg-slate-50'}`}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 h-screen w-64 z-50 flex flex-col border-r transition-transform duration-300 ${isDark ? 'bg-navy-950/90 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-200'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm">Admin Panel</p>
              <p className="text-red-400 text-[10px] font-semibold">GourmetGo · Christ University</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-white/70 text-sm font-medium">{user?.name}</p>
          <p className="text-white/40 text-xs">Super Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={toggle} className="sidebar-item w-full">{isDark ? <Sun size={18} /> : <Moon size={18} />} {isDark ? 'Light Mode' : 'Dark Mode'}</button>
          <button onClick={() => { logout(); navigate('/'); }} className="sidebar-item w-full text-red-400/70 hover:text-red-400"><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 py-3 border-b backdrop-blur-xl ${isDark ? 'bg-navy-900/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl text-white/70"><Menu size={20} /></button>
          <p className={`font-semibold text-sm ${isDark ? 'text-white/70' : 'text-navy-600'}`}>GourmetGo Admin — Christ University Central Campus</p>
        </header>
        <main className="flex-1 p-4 lg:p-6 page-enter overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
