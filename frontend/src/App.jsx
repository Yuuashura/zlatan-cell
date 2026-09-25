import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DialogProvider } from './components/DialogProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import StatusPage from './pages/StatusPage';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TopUpPage from './pages/TopUpPage';
import TopUpStatusPage from './pages/TopUpStatusPage';
import ProfilePage from './pages/ProfilePage';
import RatingsPage from './pages/RatingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminVouchersPage from './pages/AdminVouchersPage';
import AdminFlashSalePage from './pages/AdminFlashSalePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTopUpsPage from './pages/AdminTopUpsPage';
import AdminRatingsPage from './pages/AdminRatingsPage';
import AdminAiChatPage from './pages/AdminAiChatPage';
import AdminCatalogPage from './pages/AdminCatalogPage';

// Re-mounts on every route change so the page's sections replay the entrance animation (index.css).
function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DialogProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <PageTransition>
            <Routes>
              {/* User / Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/topup" element={<TopUpPage />} />
              <Route path="/topup/status/:externalId" element={<TopUpStatusPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/ulasan" element={<RatingsPage />} />

              {/* Admin Routes: role is checked before any admin UI renders */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="vouchers" element={<AdminVouchersPage />} />
                <Route path="flash-sales" element={<AdminFlashSalePage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="topups" element={<AdminTopUpsPage />} />
                <Route path="ratings" element={<AdminRatingsPage />} />
                <Route path="ai-chat" element={<AdminAiChatPage />} />
                <Route path="catalog" element={<AdminCatalogPage />} />
              </Route>

              <Route path="/akses-ditolak" element={<StatusPage code={403} />} />
              <Route path="*" element={<StatusPage code={404} />} />
            </Routes>
            </PageTransition>
          </main>
          <Footer />
        </div>
      </Router>
      </DialogProvider>
    </AuthProvider>
  );
}
