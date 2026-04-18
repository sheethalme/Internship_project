import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { CanteenProvider } from './contexts/CanteenContext';
import { ToastProvider } from './contexts/ToastContext';

// Landing
import LandingPage from './pages/Landing/LandingPage';

// Auth
import StudentAuth from './pages/Auth/StudentAuth';
import VendorAuth from './pages/Auth/VendorAuth';
import AdminAuth from './pages/Auth/AdminAuth';

// Student
import StudentLayout from './pages/Student/StudentLayout';
import StudentDashboard from './pages/Student/Dashboard';
import BrowseCanteens from './pages/Student/BrowseCanteens';
import CanteenMenu from './pages/Student/CanteenMenu';
import MyOrders from './pages/Student/MyOrders';
import LoyaltyPage from './pages/Student/LoyaltyPage';
import NotificationsPage from './pages/Student/NotificationsPage';
import GrievancesPage from './pages/Student/GrievancesPage';
import RefundsPage from './pages/Student/RefundsPage';

// Vendor
import VendorLayout from './pages/Vendor/VendorLayout';
import VendorDashboard from './pages/Vendor/VendorDashboard';
import OrderQueue from './pages/Vendor/OrderQueue';
import MenuManagement from './pages/Vendor/MenuManagement';
import VendorAnalytics from './pages/Vendor/VendorAnalytics';
import VendorGrievances from './pages/Vendor/VendorGrievances';
import VendorRefunds from './pages/Vendor/VendorRefunds';

// Admin
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminCanteens from './pages/Admin/AdminCanteens';
import AdminGrievances from './pages/Admin/AdminGrievances';
import AdminRefunds from './pages/Admin/AdminRefunds';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminReviews from './pages/Admin/AdminReviews';

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CanteenProvider>
            <OrdersProvider>
              <NotificationsProvider>
                <CartProvider>
                  <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login/student" element={<StudentAuth />} />
                    <Route path="/login/vendor" element={<VendorAuth />} />
                    <Route path="/login/admin" element={<AdminAuth />} />

                    {/* Student Portal */}
                    <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentLayout /></ProtectedRoute>}>
                      <Route index element={<StudentDashboard />} />
                      <Route path="canteens" element={<BrowseCanteens />} />
                      <Route path="canteens/:id" element={<CanteenMenu />} />
                      <Route path="orders" element={<MyOrders />} />
                      <Route path="loyalty" element={<LoyaltyPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="grievances" element={<GrievancesPage />} />
                      <Route path="refunds" element={<RefundsPage />} />
                    </Route>

                    {/* Vendor Portal */}
                    <Route path="/vendor" element={<ProtectedRoute requiredRole="vendor"><VendorLayout /></ProtectedRoute>}>
                      <Route index element={<VendorDashboard />} />
                      <Route path="queue" element={<OrderQueue />} />
                      <Route path="menu" element={<MenuManagement />} />
                      <Route path="analytics" element={<VendorAnalytics />} />
                      <Route path="grievances" element={<VendorGrievances />} />
                      <Route path="refunds" element={<VendorRefunds />} />
                    </Route>

                    {/* Admin Portal */}
                    <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="canteens" element={<AdminCanteens />} />
                      <Route path="grievances" element={<AdminGrievances />} />
                      <Route path="refunds" element={<AdminRefunds />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="reviews" element={<AdminReviews />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </CartProvider>
              </NotificationsProvider>
            </OrdersProvider>
          </CanteenProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
