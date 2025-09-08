import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api, setupAxiosInterceptors } from './components/Auth/api';
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
import ManualPass from './components/GateCheck/Pass/ManualPass';
import QRCode from './components/GateCheck/Pass/QRCode';
import AddUserModal from './components/Users/AddUserModal';
import RolesPage from './components/RolesPermissions/Roles/RolesPage';
import Permissions from './components/RolesPermissions/Permissions/PermissionsPage';
import RolePermissionsPage from './components/RolesPermissions/RolePermissionsPage';
import UserRole from './components/Users/Roles/UserRole';
import CategoryPage from './components/GateCheck/Categories/CategoryPage';
import { AuthProvider } from './context/AuthContext';

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
  const [categoryCounts, setCategoryCounts] = useState([]);

  // Separate state for counts to ensure they're always up to date
  const [visitorCount, setVisitorCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  // Category count state
  const [categoryCount, setCategoryCount] = useState(0);

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

  const handleCategoryCountsChange = (counts) => {
    console.log("Updating category counts in App:", counts); // Debug log
    setCategoryCounts(counts);
  };

  const handleUserAdded = async (newUser) => {
    console.log('New user added:', newUser);
  };

  // Callback functions to update counts from GateCheck
  const handleVisitorCountChange = (count) => {
    setVisitorCount(count);
  };

  const handleVendorCountChange = (count) => {
    setVendorCount(count);
  };

  const handleLogin = async (userData, token, captchaValue) => {
    try {
      if (!captchaValue || captchaValue.trim() === '') {
        throw new Error('Please complete the captcha verification');
      }
      
      // Store auth data consistently
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours from now
      
      localStorage.setItem('demoAuthToken', token || 'demo-token');
      localStorage.setItem('authToken', token || 'demo-token');
      localStorage.setItem('userProfile', JSON.stringify(userData));
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      setIsAuthenticated(true);
      setUserProfile(userData);
      
      console.log('Login successful for:', userData.email);
      console.log('Token expiry set to:', new Date(expiryTime));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    try {
      // Clear all possible auth-related items
      const authKeys = [
        'demoAuthToken',
        'authToken', 
        'userProfile',
        'tokenExpiry',
        'refreshToken',
        'sessionData'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      setIsAuthenticated(false);
      setUserProfile(null);
      setVisitors([]);
      setVendors([]);
      setVisitorCount(0);
      setVendorCount(0);
      setShowAddUserModal(false);
      
      console.log('Logout successful - all auth data cleared');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.visitors.getAll();
      setVisitors(response.data);
      setVisitorCount(response.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
      setVisitorCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.visitors.getAll({ type: 'vendor' }); // Assuming you have a way to filter vendors
      setVendors(response.data);
      setVendorCount(response.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setVendorCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setupAxiosInterceptors();
    
    const checkAuthStatus = () => {
      try {
        // Check for both demo and regular auth tokens
        const demoToken = localStorage.getItem('demoAuthToken');
        const authToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('userProfile');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        
        console.log('Checking auth status:', { 
          hasDemoToken: !!demoToken, 
          hasAuthToken: !!authToken, 
          hasSavedUser: !!savedUser, 
          hasTokenExpiry: !!tokenExpiry 
        });
        
        // Check if we have any valid token and user data
        if ((demoToken || authToken) && savedUser) {
          // If no expiry is set, assume it's valid (for demo mode)
          if (!tokenExpiry) {
            console.log('No expiry set, assuming valid session');
            const userData = JSON.parse(savedUser);
            setIsAuthenticated(true);
            setUserProfile(userData);
            console.log('Restored session for:', userData.email);
            return;
          }
          
          // Check expiry if it exists
          const now = new Date().getTime();
          const expiryTime = parseInt(tokenExpiry);
          
          if (now < expiryTime) {
            const userData = JSON.parse(savedUser);
            setIsAuthenticated(true);
            setUserProfile(userData);
            console.log('Restored valid session for:', userData.email);
          } else {
            console.log('Session expired, clearing auth data');
            handleLogout();
          }
        } else {
          console.log('No valid session found');
          // Don't call handleLogout here as it might clear valid data
          setIsAuthenticated(false);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Only logout on critical errors, not parsing errors
        console.log('Auth check failed, but not clearing session');
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    };
    
    checkAuthStatus();
    
    // Only fetch data if authenticated
    if (isAuthenticated) {
      fetchVisitors();
      fetchVendors();
    }
  }, [isAuthenticated]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider className="w-screen h-screen overflow-hidden bg-gray-50">
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
                        <Route 
                          path="/dashboard" 
                          element={
                            <Dashboard 
                              user={userProfile} 
                              onLogout={handleLogout} 
                              totalVisitors={visitorCount}
                              totalVendors={vendorCount}
                            />
                          } 
                        />
                        <Route
                          path="/gatecheck"
                          element={
                            <GateCheck
                              onVisitorCountChange={handleVisitorCountChange}
                              onVendorsCountChange={handleVendorCountChange}
                              onCategoryCountsChange={handleCategoryCountsChange}
                              userCompany={userProfile?.company_id} // Ensure this is the ID, not the name
                              user={userProfile}
                            />
                          }
                        />
                        <Route
                          path="/visitors"
                          element={
                            <VisitorsPage
                              totalVisitors={visitorCount}
                              visitors={visitors}
                              categoryCounts={categoryCounts} // Make sure this is passed
                            />
                          }
                        />
                        <Route 
                          path="/vendors" 
                          element={
                            <VendorsPage 
                              totalVendors={vendorCount} 
                              vendors={vendors} 
                            />
                          } 
                        />
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
                        <Route path="/category" element={<CategoryPage setCategoryCount={setCategoryCount} />} />
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
    </AuthProvider>
  );
}

export default App;