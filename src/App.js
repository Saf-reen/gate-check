import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Common/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import GateCheck from './components/GateCheck/GateCheck';
import Organization from './components/Organization/Organization';
import Navbar from './components/Common/Navbar';
import LoginForm from './components/LoginForm/LoginForm';
import ForgotPassword from './components/LoginForm/ForgotPassword';
import ProfilePage from './components/ProfilePage/ProfilePage';
import UserManagement from './components/Users/UserManagement';
import Reports from './components/Reports/Reports';
import VisitorsPage from './components/GateCheck/VisitorsPage';
import VendorsPage from './components/GateCheck/VendorsPage';
import ManualPass from './components/GateCheck/ManualPass';
import QRCode from './components/GateCheck/QRCode';
import AddUserModal from './components/Users/AddUserModal';
import RolesPage from './components/RolesPermissions/Roles/RolesPage';
import Permissions from './components/RolesPermissions/Permissions/PermissionsPage';
import RolePermissionsPage from './components/RolesPermissions/RolePermissionsPage';
import UserRole from './components/Users/Roles/UserRole';

// Configuration for demo/production mode
const DEMO_MODE = true; // Set to false to enable full authentication

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children, isAuthenticated }) => {
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const [visitors, setVisitors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  const totalVisitors = visitors.length;
  const totalVendors = vendors.length;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    console.log('Section changed to:', section);
  };

  const handleOpenAddUserModal = (organizationId = null) => {
    setCompanyId(organizationId || userProfile?.company_id || null);
    setShowAddUserModal(true);
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
    setCompanyId(null);
  };

  const handleUserAdded = async (newUser) => {
    console.log('New user added:', newUser);
  };

  const handleLogin = async (userData, token, captchaValue) => {
    try {
      if (!captchaValue || captchaValue.trim() === '') {
        throw new Error('Please complete the captcha verification');
      }

      setIsAuthenticated(true);
      setUserProfile(userData);
      console.log('Demo login successful for:', userData.email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('demoAuthToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUserProfile(null);
      setVisitors([]);
      setShowAddUserModal(false);

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('demoAuthToken');
        const savedUser = localStorage.getItem('userProfile');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        if (token && savedUser && tokenExpiry) {
          const now = new Date().getTime();
          const expiryTime = parseInt(tokenExpiry);

          if (now < expiryTime) {
            const userData = JSON.parse(savedUser);
            setIsAuthenticated(true);
            setUserProfile(userData);
            console.log('Restored demo session for:', userData.email);
          } else {
            console.log('Demo session expired, clearing auth data');
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        handleLogout();
      }
    };
    checkAuthStatus();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <LoginForm onLogin={handleLogin} />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <div className="min-h-screen bg-white bg-cover">
                <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                  <div className="relative w-full max-w-3xl mx-auto overflow-hidden">
                    <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-[400px] sm:min-h-[500px]">
                      <ForgotPassword />
                    </div>
                  </div>
                </div>
              </div>
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex w-screen h-screen overflow-hidden">
                <Sidebar
                  activeSection="dashboard"
                  onSectionChange={handleSectionChange}
                  userProfile={userProfile}
                  isOpen={isSidebarOpen}
                />
                <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-[190px]' : 'ml-0'}`}>
                  <Navbar
                    user={userProfile}
                    onSidebarToggle={toggleSidebar}
                    onLogout={handleLogout}
                    isSidebarOpen={isSidebarOpen}
                  />
                  <main className="flex-1 pt-16 overflow-y-auto">
                    <div className="p-6">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard visitors={visitors} totalVisitors={totalVisitors} user={userProfile} onLogout={handleLogout} />} />
                        <Route path="/gatecheck" element={<GateCheck visitors={visitors} setVisitors={setVisitors} totalVisitors={totalVisitors} vendors={vendors} setVendors={setVendors} totalVendors={totalVendors} userProfile={userProfile} user={userProfile} />} />
                        <Route path="/visitors" element={<VisitorsPage totalVisitors={totalVisitors} visitors={visitors} />} />
                        <Route path="/vendors" element={<VendorsPage totalVendors={totalVendors} vendors={vendors} />} />
                        <Route path="/reports" element={<Reports userProfile={userProfile} />} />
                        <Route path="/profile" element={<ProfilePage userProfile={userProfile} onLogout={handleLogout} />} />
                        <Route path="/organization" element={<Organization userProfile={userProfile} user={userProfile} onLogout={handleLogout} onOpenAddUserModal={handleOpenAddUserModal} />} />
                        <Route path="/user" element={<UserManagement onOpenAddUserModal={handleOpenAddUserModal} />} />
                        <Route path="/roles" element={<RolesPage />} />
                        <Route path="/permissions" element={<Permissions />} />
                        <Route path="/rolespermissions" element={<RolePermissionsPage />} />
                        <Route path="/userroles" element={<UserRole userProfile={userProfile} />} />
                        <Route path="/manual-pass" element={<ManualPass />} />
                        <Route path="/qr-pass" element={<QRCode />} />
                        <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/GateCheck" element={<Navigate to="/gatecheck" replace />} />
                        <Route path="/Reports" element={<Navigate to="/reports" replace />} />
                        <Route path="/ProfilePage" element={<Navigate to="/profile" replace />} />
                        <Route path="/Organization" element={<Navigate to="/organization" replace />} />
                        <Route path="/UserManagement" element={<Navigate to="/user" replace />} />
                        <Route path="/RolesManagement" element={<Navigate to="/roles" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </div>
                  </main>
                </div>
                {isSidebarOpen && <div className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden" onClick={toggleSidebar} />}
                {showAddUserModal && <AddUserModal onClose={handleCloseModal} onUserAdded={handleUserAdded} organizationId={companyId} />}
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;