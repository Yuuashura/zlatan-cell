import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TopUpPage from './pages/TopUpPage';
import TopUpStatusPage from './pages/TopUpStatusPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminVouchersPage from './pages/AdminVouchersPage';
import AdminFlashSalePage from './pages/AdminFlashSalePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTopUpsPage from './pages/AdminTopUpsPage';
import AdminRatingsPage from './pages/AdminRatingsPage';
import AdminAiChatPage from './pages/AdminAiChatPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
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

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
              <Route path="/admin/flash-sales" element={<AdminFlashSalePage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/topups" element={<AdminTopUpsPage />} />
              <Route path="/admin/ratings" element={<AdminRatingsPage />} />
              <Route path="/admin/ai-chat" element={<AdminAiChatPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
