import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import { Home } from './pages/Home';
import { Vehicles } from './pages/Vehicles';
import { VehicleDetails } from './pages/VehicleDetails';
import { OfficeMap } from './pages/OfficeMap';
import { TouristGuides } from './pages/TouristGuides';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { CustomerDashboard } from './pages/CustomerDashboard';

// Legal Pages (Razorpay Live KYC Mandatory)
import { Terms } from './pages/legal/Terms';
import { Privacy } from './pages/legal/Privacy';
import { RefundPolicy } from './pages/legal/RefundPolicy';
import { ContactUs } from './pages/legal/ContactUs';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVehicles } from './pages/admin/AdminVehicles';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminPayments } from './pages/admin/AdminPayments';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading...</div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/admin/login" />;
  
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatedOutlet />
      </main>
    </div>
  );
};

// Animated Page Wrapper
const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Custom animated outlet for Admin routes
import { Outlet } from 'react-router-dom';
const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/vehicles" element={<PageWrapper><Vehicles /></PageWrapper>} />
        <Route path="/vehicles/:id" element={<PageWrapper><VehicleDetails /></PageWrapper>} />
        <Route path="/map" element={<PageWrapper><OfficeMap /></PageWrapper>} />
        <Route path="/tourist-guides" element={<PageWrapper><TouristGuides /></PageWrapper>} />
        
        {/* Legal & Policy Pages for Razorpay KYC */}
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/refund-policy" element={<PageWrapper><RefundPolicy /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><ContactUs /></PageWrapper>} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        
        {/* Customer Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageWrapper><CustomerDashboard /></PageWrapper>
          </ProtectedRoute>
        } />
        
        {/* Admin Protected Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/vehicles" element={<AdminVehicles />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const MainLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
