import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './admin-styles/theme.css';

// Main Website Components
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import AboutContact from './components/AboutContact';
import Campaigns from './components/Campaigns';
import RequestBlood from './components/RequestBlood';
import DonateBloodRequests from './components/DonateBloodRequests';
import QuickLinks from './components/QuickLinks';
import LiveStats from './components/LiveStats';
import Features from './components/Features';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Profile from './components/Profile';
import Privacy from './components/Privacy';
import AdminSetup from './components/AdminSetup';

// Admin Components
import Layout from './admin-components/common/Layout';
import AdminLogin from './admin-pages/Login';
import Dashboard from './admin-pages/Dashboard';
import Users from './admin-pages/Users';
import BloodRequests from './admin-pages/BloodRequests';
import BloodDonations from './admin-pages/BloodDonations';
import BloodDrives from './admin-pages/BloodDrives';
import Inventory from './admin-pages/Inventory';
import Requirements from './admin-pages/Requirements';
import Notifications from './admin-pages/Notifications';
import ProfileSettings from './admin-pages/ProfileSettings';
import AccountSettings from './admin-pages/AccountSettings';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminPermissions } from './utils/adminPermissions';

// Universal Protected Route Component - All users need authentication
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is admin, redirect to admin interface for admin routes
  if (AdminPermissions.isAdmin(user) && window.location.pathname.startsWith('/admin')) {
    return children;
  }
  
  return children;
};

// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Check if user is admin using AdminPermissions utility
  if (!AdminPermissions.isAdmin(user)) {
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Check if user is admin and redirect accordingly
    if (AdminPermissions.isAdmin(user)) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }
  
  return children;
};

// Landing Page Route - Redirects to appropriate dashboard based on user role
const LandingRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is admin, redirect to admin dashboard
  if (AdminPermissions.isAdmin(user)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Regular users go to profile (consolidated dashboard)
  return <Navigate to="/profile" replace />;
};

// Main Website Page Components - All require authentication
const HomePage = () => (
  <>
    <Navigation />
    <Hero />
    <QuickLinks />
    <LiveStats />
    <Features />
    <Footer />
  </>
);

const AboutContactPage = () => (
  <>
    <Navigation />
    <AboutContact />
    <Footer />
  </>
);

const RequestPage = () => (
  <>
    <Navigation />
    <RequestBlood />
    <Footer />
  </>
);

const DonateBloodPage = () => (
  <>
    <Navigation />
    <DonateBloodRequests />
    <Footer />
  </>
);

const CampaignsPage = () => (
  <>
    <Navigation />
    <Campaigns />
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Routes>
            {/* Main Website Routes - All require authentication */}
            <Route path="/" element={<LandingRoute />} />
            <Route path="/home" element={<AuthenticatedRoute><HomePage /></AuthenticatedRoute>} />
            <Route path="/about" element={<AuthenticatedRoute><AboutContactPage /></AuthenticatedRoute>} />
            <Route path="/contact" element={<AuthenticatedRoute><AboutContactPage /></AuthenticatedRoute>} />
            <Route path="/campaigns" element={<AuthenticatedRoute><CampaignsPage /></AuthenticatedRoute>} />
            <Route path="/donate-blood" element={<AuthenticatedRoute><DonateBloodPage /></AuthenticatedRoute>} />
            <Route path="/request" element={<AuthenticatedRoute><RequestPage /></AuthenticatedRoute>} />
            {/* Redirect dashboard to profile (consolidated) */}
            <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
            
            {/* Unified Login Route */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Register Route */}
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Forgot Password Route */}
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            
            {/* Privacy Policy Route */}
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Admin Setup Route */}
            <Route path="/admin-setup" element={<AdminSetup />} />
            
            {/* Profile Route */}
            <Route 
              path="/profile" 
              element={
                <AuthenticatedRoute>
                  <Profile />
                </AuthenticatedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/login" 
              element={<AdminLogin />}
            />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="blood-requests" element={<BloodRequests />} />
              <Route path="blood-donations" element={<BloodDonations />} />
              <Route path="blood-drives" element={<BloodDrives />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="requirements" element={<Requirements />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile-settings" element={<ProfileSettings />} />
              <Route path="account-settings" element={<AccountSettings />} />
            </Route>
            
            {/* Redirect /admin to /admin/dashboard when authenticated */}
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Legacy routes redirect */}
            <Route path="/user/dashboard" element={<Navigate to="/profile" replace />} />
          </Routes>
          
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
