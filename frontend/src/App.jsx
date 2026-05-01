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
import StudentAuth from './pages/auth/StudentAuth';
import VendorAuth from './pages/auth/VendorAuth';
import AdminAuth from './pages/auth/AdminAuth';

// Student
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import BrowseCanteens from './pages/student/BrowseCanteens';
import CanteenMenu from './pages/student/CanteenMenu';
import MyOrders from './pages/student/MyOrders';
import LoyaltyPage from './pages/student/LoyaltyPage';
import NotificationsPage from './pages/student/NotificationsPage';
import GrievancesPage from './pages/student/GrievancesPage';
import RefundsPage from './pages/student/RefundsPage';
import BulkOrderForm from './pages/student/BulkOrderForm';

// Vendor
import VendorLayout from './pages/vendor/VendorLayout';
import VendorDashboard from './pages/vendor/VendorDashboard';
import OrderQueue from './pages/vendor/OrderQueue';
import MenuManagement from './pages/vendor/MenuManagement';
import VendorAnalytics from './pages/vendor/VendorAnalytics';
import VendorGrievances from './pages/vendor/VendorGrievances';
import VendorRefunds from './pages/vendor/VendorRefunds';
import VendorBulkOrders from './pages/vendor/VendorBulkOrders';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCanteens from './pages/admin/AdminCanteens';
import AdminGrievances from './pages/admin/AdminGrievances';
import AdminRefunds from './pages/admin/AdminRefunds';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReviews from './pages/admin/AdminReviews';
import AdminBulkOrders from './pages/admin/AdminBulkOrders';

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
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
                    <Route path="/login/vendor"  element={<VendorAuth />} />
                    <Route path="/login/admin"   element={<AdminAuth />} />

                    {/* Student Portal */}
                    <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentLayout /></ProtectedRoute>}>
                      <Route index element={<StudentDashboard />} />
                      <Route path="canteens" element={<BrowseCanteens />} />
                      <Route path="canteens/:id" element={<CanteenMenu />} />
                      <Route path="orders" element={<MyOrders />} />
                      <Route path="bulk-order" element={<BulkOrderForm />} />
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
                      <Route path="bulk-orders" element={<VendorBulkOrders />} />
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
                      <Route path="bulk-orders" element={<AdminBulkOrders />} />
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
