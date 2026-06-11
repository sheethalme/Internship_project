import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Store, ShoppingBag, ClipboardList, Award, Bell, AlertCircle, RefreshCw, LogOut, Sun, Moon, Menu, X, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useTheme } from '../../contexts/ThemeContext';
import CartDrawer from '../../components/layout/CartDrawer';

const NAV = [
  { to: '/student', icon: Home, label: 'Home', end: true },
  { to: '/student/canteens', icon: Store, label: 'Canteens' },
  { to: '/student/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/student/loyalty', icon: Award, label: 'Loyalty' },
  { to: '/student/notifications', icon: Bell, label: 'Alerts' },
  { to: '/student/grievances', icon: AlertCircle, label: 'Issues' },
  { to: '/student/refunds', icon: RefreshCw, label: 'Refunds' },
  { to: '/student/bulk-order', icon: CalendarDays, label: 'Bulk Order' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const { getTotalItems, setIsOpen } = useCart();
  const { unreadCount } = useNotifications();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cartCount = getTotalItems();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-navy-900' : 'bg-slate-50'}`}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 z-50 flex flex-col border-r transition-transform duration-300 ${isDark ? 'bg-navy-950/90 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-200'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center">
              <span className="text-navy-900 font-black text-lg">G</span>
            </div>
            <div>
              <p className="font-black text-white text-base">GourmetGo</p>
              <p className="text-gold-500 text-[10px] font-semibold">Student Portal</p>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/40 text-xs truncate">{user?.roll_number || user?.student_code}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
              {label === 'Alerts' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={toggle} className="sidebar-item w-full">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400/70 hover:text-red-400">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 border-b backdrop-blur-xl ${isDark ? 'bg-navy-900/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl text-white/70">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-navy-500'}`}>Christ University · Central Campus</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <NavLink to="/student/notifications" className="relative p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Bell size={20} className={isDark ? 'text-white/70' : 'text-navy-600'} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </NavLink>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-gold-500/20 hover:bg-gold-500/30 rounded-xl transition-colors"
            >
              <ShoppingBag size={18} className="text-gold-400" />
              <span className="text-gold-400 font-bold text-sm hidden sm:block">Cart</span>
              {cartCount > 0 && (
                <span className="bg-gold-500 text-navy-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 page-enter overflow-auto pb-20 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl ${isDark ? 'bg-navy-950/90 border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-around px-2 py-2">
            {NAV.slice(0, 5).map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
                <div className="relative">
                  <Icon size={20} />
                  {label === 'Alerts' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">{unreadCount}</span>
                  )}
                </div>
                <span className="text-[10px]">{label}</span>
              </NavLink>
            ))}
            <button onClick={() => setIsOpen(true)} className="bottom-nav-item relative">
              <div className="relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
              </div>
              <span className="text-[10px]">Cart</span>
            </button>
          </div>
        </div>
      </div>

      <CartDrawer />
    </div>
  );
}
