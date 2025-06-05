import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Common/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import GateCheck from './components/GateCheck/GateCheck';
import Organization from './components/Organization/Organization';
import AddUserModal from './components/Users/AddUserModal';
import Navbar from './components/Common/Navbar';
import LoginForm from './components/LoginForm/LoginForm';
import ForgotPassword from './components/LoginForm/ForgotPassword'; // Import ForgotPassword component

// Configuration for demo/production mode
const DEMO_MODE = true; // Set to false to enable full authentication

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
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
  // State management - FIXED: Correct useState declaration
  const [visitors, setVisitors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate total visitors count
  const totalVisitors = visitors.length;

  // Handle login with flexible validation (accepts any credentials)
  const handleLogin = async (userData, token, captchaValue) => {
    try {
      // For demo mode: accept any credentials but validate captcha exists
      if (!captchaValue || captchaValue.trim() === '') {
        throw new Error('Please complete the captcha verification');
      }

      // Accept any email/password combination for demo
      if (!userData || !userData.email || !userData.password) {
        throw new Error('Please enter both email and password');
      }

      // Create demo user profile from login data
      const demoUserProfile = {
        id: 1,
        name: userData.name || userData.email.split('@')[0],
        role: 'admin',
        email: userData.email,
        organization: 'Demo Organization'
      };

      // Set demo token expiry (e.g., 24 hours from now)
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
      
      // In demo mode, we can store basic info without real tokens
      if (DEMO_MODE) {
        localStorage.setItem('demoAuthToken', 'demo-token-' + Date.now());
        localStorage.setItem('userProfile', JSON.stringify(demoUserProfile));
        localStorage.setItem('tokenExpiry', expiryTime.toString());
      }
      
      // Update state
      setIsAuthenticated(true);
      setUserProfile(demoUserProfile);

      console.log('Demo login successful for:', userData.email);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Handle logout
  const handleLogout = () => {
    try {
      // Clear authentication data
      localStorage.removeItem('demoAuthToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('tokenExpiry');
      setIsAuthenticated(false);
      setUserProfile(null);
      setVisitors([]);
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check for existing session on app load
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
    <div className="h-screen bg-gray-50">
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <LoginForm onLogin={handleLogin} demoMode={DEMO_MODE} />
            </PublicRoute>
          }
        />

        {/* Forgot Password Route */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute isAuthenticated={isAuthenticated}>
              <div className="min-h-screen bg-cover bg-gradient-to-br from-green-100 to-yellow-50">
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

        {/* Main Application Routes - PROTECTED */}
        <Route
          path="/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex flex-col flex-1">
                  <Navbar 
                    user={userProfile}
                    onLogout={handleLogout}
                  />
                  <div className="flex-1 p-6">
                    <Routes>
                      {/* Default redirect */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      
                      {/* Main Routes - FIXED: Correct props passing */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <Dashboard 
                            visitors={visitors}
                            totalVisitors={totalVisitors}
                            user={userProfile}
                            onLogout={handleLogout}
                          />
                        } 
                      />
                      <Route 
                        path="/gatecheck" 
                        element={
                          <GateCheck 
                            visitors={visitors}
                            setVisitors={setVisitors}
                            totalVisitors={totalVisitors}
                            userProfile={userProfile}
                          />
                        } 
                      />
                      <Route 
                        path="/organization" 
                        element={<Organization userProfile={userProfile} />} 
                      />
                      <Route 
                        path="/user" 
                        element={<AddUserModal userProfile={userProfile} />} 
                      />
                      
                      {/* Case-insensitive route aliases */}
                      <Route path="/Dashboard" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/GateCheck" element={<Navigate to="/gatecheck" replace />} />
                      <Route path="/Organization" element={<Navigate to="/organization" replace />} />
                      <Route path="/User" element={<Navigate to="/user" replace />} />
                      
                      {/* Fallback route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;