import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, RefreshCw, User, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
// import bg_img from '../asset/bg_img.jpg'; // Assuming you have a background image
 // Assuming you have a background image

const LoginForm = ({ onLogin, demoMode = true }) => { // Changed from onLoginSuccess to onLogin
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [userIdAlias, setUserIdAlias] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Generate random captcha
  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
  }, []);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate captcha on component mount and refresh
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  // Handle Enter key navigation for Step 1
  const handleStep1KeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFirstSignIn();
    }
  };

  // Handle Enter key navigation for Step 2
  const handleStep2KeyDown = (e, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (currentField === 'password') {
        // Move focus to captcha field
        const captchaInput = document.querySelector('input[placeholder="Enter the captcha..."]');
        if (captchaInput) {
          captchaInput.focus();
        }
      } else if (currentField === 'captcha') {
        // Submit the form
        handleFinalSignIn();
      }
    }
  };

  // Simulate API call with axios-like structure
  const apiCall = async (endpoint, data) => {
    // Simulating axios API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (endpoint === '/api/validate-user' && data.userIdAlias) {
          resolve({ data: { success: true, message: 'User validated' } });
        } else if (endpoint === '/api/login' && data.password && data.captcha) {
          if (data.captcha === captchaValue) {
            resolve({ 
              data: { 
                success: true, 
                message: 'Login successful',
                token: 'mock-jwt-token',
                user: { 
                  id: 1, 
                  name: data.userIdAlias, 
                  email: data.userIdAlias + '@example.com', // Add email for App.js compatibility
                  role: 'admin' 
                }
              } 
            });
          } else {
            reject({ response: { data: { error: 'Invalid captcha' } } });
          }
        } else {
          reject({ response: { data: { error: 'Invalid credentials' } } });
        }
      }, 1500);
    });
  };

  const handleFirstSignIn = async () => {
    if (!userIdAlias.trim()) {
      setErrors({ userIdAlias: 'Please enter UserID or Alias Name' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await apiCall('/api/validate-user', { userIdAlias });
      if (response.data.success) {
        setCurrentStep(2);
        // Focus on password field after transition
        setTimeout(() => {
          const passwordInput = document.querySelector('input[type="password"], input[type="text"][placeholder="Enter Password"]');
          if (passwordInput) {
            passwordInput.focus();
          }
        }, 600); // Wait for transition to complete
      }
    } catch (error) {
      setErrors({ userIdAlias: 'User not found. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSignIn = async () => {
    const newErrors = {};
    
    if (!password.trim()) {
      newErrors.password = 'Please enter your password';
    }
    
    if (!captcha.trim()) {
      newErrors.captcha = 'Please enter the captcha';
    } else if (captcha.toUpperCase() !== captchaValue.toUpperCase()) {
      newErrors.captcha = 'Captcha does not match';
    }
      
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await apiCall('/api/login', {
        userIdAlias,
        password,
        captcha
      });
      
      if (response.data.success) {
        // Prepare user data for App.js handleLogin function
        const userData = {
          email: response.data.user.email,
          password: password, // Include password for App.js validation
          name: response.data.user.name
        };
        
        // Call onLogin with the expected parameters: (userData, token, captchaValue)
        await onLogin(userData, response.data.token, captcha);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setErrors({ general: errorMessage });
      generateCaptcha(); // Refresh captcha on error
      setCaptcha('');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const refreshCaptcha = () => {
    generateCaptcha();
    setCaptcha('');
    setErrors(prev => ({ ...prev, captcha: '' }));
  };

  return (
    <div className="min-h-screen bg-center bg-cover bg-gradient-to-br from-green-100 to-yellow-50 no-repeatbg"
    // style ={{ backgroundImage: `url(${bg_img})` }}
    >
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div className="relative w-full max-w-3xl mx-auto overflow-hidden">
          
          {/* Background geometric shapes - responsive */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-16 h-16 transform bg-gray-200 rounded-lg top-5 left-5 sm:top-10 sm:left-10 sm:w-32 sm:h-32 opacity-30 rotate-12 animate-pulse"></div>
            <div className="absolute w-12 h-12 bg-pink-200 rounded-full top-20 right-10 sm:top-40 sm:right-20 sm:w-24 sm:h-24 opacity-40 animate-bounce"></div>
            <div className="absolute w-16 h-16 transform rounded-lg opacity-25 bottom-10 left-1/4 sm:bottom-20 sm:w-28 sm:h-28 bg-black-200 -rotate-6 animate-pulse"></div>
            <div className="absolute w-10 h-10 bg-gray-300 rounded-full top-1/3 left-1/3 sm:w-20 sm:h-20 opacity-20 animate-ping"></div>
          </div>

          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-[400px] sm:min-h-[500px] flex flex-col lg:flex-row">
            
            {/* Right Panel - Login Forms */}
            <div className={`${isMobile ? 'order-1' : 'order-2'} flex-1 relative bg-gradient-to-br from-green-600 to-yellow-100`}>
              
              {/* Step 1 - Initial Login */}
              <div className={`absolute inset-0 p-4 sm:p-8 lg:p-12 flex flex-col justify-center transition-transform duration-500 ease-in-out ${
                currentStep === 1 ? 'translate-x-0' : '-translate-x-full'
              }`}>
                <div className="w-full max-w-sm p-4 mx-auto bg-white shadow-xl rounded-xl sm:p-8">
                  
                  <div className="mb-4 text-center sm:mb-8">
                    <h1 className="mb-2 text-base font-bold tracking-wider text-green-800 sm:text-lg sm:mb-4">SMART CHECK</h1>
                    <h2 className="text-xl font-bold text-gray-800 sm:text-xl">Sign In</h2>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        UserID / AliasName
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={userIdAlias}
                          onChange={(e) => {
                            setUserIdAlias(e.target.value);
                            setErrors(prev => ({ ...prev, userIdAlias: '' }));
                          }}
                          onKeyDown={handleStep1KeyDown}
                          placeholder="Enter userid / aliasname"
                          className={`w-full px-2 py-1 border focus:ring-2 text-sm focus:ring-black-400 focus:border-transparent pr-8 transition-colors ${
                            errors.userIdAlias ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={loading}
                          autoFocus
                        />
                        <User className="absolute right-3 top-1.5 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.userIdAlias && (
                        <p className="mt-1 text-sm text-red-500">{errors.userIdAlias}</p>
                      )}
                    </div>

                    <button
                      onClick={handleFirstSignIn}
                      disabled={loading}
                      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-semibold text-white transition-all duration-200 bg-gray-800 rounded-sm hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>Sign In</span>
                          <span className="ml-2">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 - Password and Captcha */}
              <div className={`absolute inset-0 p-2 sm:p-6 lg:p-10 flex flex-col justify-center transition-transform duration-500 ease-in-out ${
                currentStep === 2 ? 'translate-x-0' : 'translate-x-full'
              }`}>
                <div className="w-full max-w-sm p-2 mx-auto bg-white shadow-xl rounded-xl sm:p-6">
                  {/* Organization Header */}
                  <div className="mb-6 text-center sm:mb-8">
                    <div className="flex justify-center m-2">
                      <div className="flex items-center justify-center w-8 h-8 border-2 border-green-800 rounded-full sm:w-12 sm:h-12">
                        <span className="text-sm font-bold text-green-800 sm:text-sm">S-C</span>
                      </div>
                    </div>
                    <h2 className="font-semibold text-gray-800 text-md sm:text-md">SRIA</h2>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors(prev => ({ ...prev, password: '' }));
                          }}
                          onKeyDown={(e) => handleStep2KeyDown(e, 'password')}
                          placeholder="Enter Password"
                          className={`w-full px-2 py-1 border text-sm focus:ring-2 focus:ring-black-400 focus:border-transparent pr-10 transition-colors ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Captcha <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={captcha}
                          onChange={(e) => {
                            setCaptcha(e.target.value);
                            setErrors(prev => ({ ...prev, captcha: '' }));
                          }}
                          onKeyDown={(e) => handleStep2KeyDown(e, 'captcha')}
                          placeholder="Enter the captcha..."
                          className={`w-full px-2 py-1 border focus:ring-2 text-sm focus:ring-black-400 focus:border-transparent pr-8 transition-colors ${
                            errors.captcha ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={loading}
                        />
                        <User className="absolute right-1 top-1.5 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.captcha && (
                        <p className="mt-1 text-sm text-red-500">{errors.captcha}</p>
                      )}
                    </div>

                    {/* Captcha Display */}
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1 px-2 py-1 overflow-hidden font-mono text-sm tracking-wider text-center border border-gray-300 select-none bg-gradient-to-r from-gray-100 to-gray-200">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        <span className="relative font-bold text-gray-800 z-4 w-70">{captchaValue}</span>
                      </div>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="p-1 text-gray-500 transition-all duration-200 hover:text-gray-700 hover:bg-gray-100 hover:scale-110 active:scale-95"
                        title="Refresh Captcha"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>

                  {errors.general && (
                    <div className="p-1 text-sm text-center text-red-700 mb-w">
                      {errors.general}
                    </div>
                  )}
                    <button
                      onClick={handleFinalSignIn}
                      disabled={loading}
                      className="flex items-center justify-center w-full px-4 py-1 space-x-1 text-sm font-medium text-white transition-all duration-200 bg-gray-800 rounded-sm hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <User className="w-6 h-6" />
                          <span>Sign In</span>
                          <span className="ml-2">→</span>
                        </>
                      )}
                    </button>

                    <div className="pl-10 text-center">
                      {/* <button 
                      href="/forgot-password"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-800 hover:underline"
                      >
                        Forgot password?
                      </button> */}
                      <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back button for step 2 */}
              {currentStep === 2 && (
                <button
                  onClick={handleBackToStep1}
                  className="absolute p-2 text-white transition-all duration-200 rounded-sm top-4 left-4 bg-white/20 hover:bg-white/30 hover:scale-110 active:scale-95"
                  title="Go Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;