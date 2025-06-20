import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, RefreshCw, User, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '../Auth/AuthService';
import { api, setupAxiosInterceptors } from '../Auth/api';
// import bg_img from '../asset/bg_img.jpg';

const LoginForm = ({ onLogin }) => {
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

  // Setup axios interceptors and generate captcha on component mount
  useEffect(() => {
    setupAxiosInterceptors(authService);
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

  // Validate user input (email format, length, etc.)
  const validateUserInput = (input) => {
    const trimmedInput = input.trim();
    
    // Check if empty
    if (!trimmedInput) {
      return { isValid: false, error: 'Please enter UserID, Alias Name, or Email' };
    }

    // Check minimum length
    if (trimmedInput.length < 3) {
      return { isValid: false, error: 'Input must be at least 3 characters long' };
    }

    // If it contains @ symbol, validate as email
    if (trimmedInput.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedInput)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
    }

    // Check for invalid characters (basic validation)
    const validChars = /^[a-zA-Z0-9@._-]+$/;
    if (!validChars.test(trimmedInput)) {
      return { isValid: false, error: 'Only letters, numbers, @, ., _, and - are allowed' };
    }

    return { isValid: true, error: null };
  };

const handleFirstSignIn = async () => {
  const validation = validateUserInput(userIdAlias);
  if (!validation.isValid) {
    setErrors({ userIdAlias: validation.error });
    return;
  }

  setLoading(true);
  setErrors({});

  const checkUserPayload = {
    identifier: userIdAlias.trim(),
  };

  try {
    const response = await api.auth.validateUser(checkUserPayload);
    console.log("User validation response:", response.data);

    // ✅ If the API responds with 200 OK, user exists
    setCurrentStep(2);
    setTimeout(() => {
      const passwordInput = document.querySelector(
        'input[type="password"], input[placeholder="Enter Password"]'
      );
      if (passwordInput) passwordInput.focus();
    }, 600);
  } catch (error) {
    console.error("User validation error:", error);

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "User validation failed";

    if (
      errorMessage.toLowerCase().includes("user not found") ||
      errorMessage.toLowerCase().includes("invalid user") ||
      error.response?.status === 404
    ) {
      setErrors({
        userIdAlias: "User not found. Please check your UserID, Alias, or Email.",
      });
    } else {
      setErrors({ userIdAlias: errorMessage });
    }
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
    } else if (captcha !== captchaValue) {
      newErrors.captcha = 'Captcha does not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare credentials for API call
      const credentials = {
        identifier: userIdAlias, // Adjust field name based on your backend expectations
        password: password
        // Note: captcha is validated on frontend only, not sent to backend
      };
      console.log(credentials);

      // Make login request using the API service
      const response = await api.auth.login(credentials);
      if (response.data) {


 
        // Extract data from API response
        const { 
         access:access,
         refresh:refresh,
         user,
          data: responseData 
        } = response.data;


        
        const authToken = access || responseData?.access || '';
        const refreshToken = refresh || responseData?.refresh || '';

        if(authToken) { 

          localStorage.setItem('authToken', authToken);
          localStorage.setItem('refreshToken', refreshToken || '');
          console.log('Tokens stored in localStorage:', {
            authToken})
        };

        
        // Store tokens in localStorage
    
      
        
        // Prepare user data for parent component
        const userData = {
          id: user?.id || responseData?.user?.id,
          email: user?.email || responseData?.user?.email || userIdAlias,
          name: user?.name || responseData?.user?.name || user?.username,
          role: user?.role || responseData?.user?.role,
          // Add any other user properties your app needs
          ...(user || responseData?.user || {})
        };
        
        // Set user data in authService if it exists
        if (authService) {
          if (authService.setUser) {
            authService.setUser(userData);
          }
          if (authService.setToken) {
            authService.setToken(authToken);
          }
        }
        
        // Call parent onLogin callback
        if (onLogin) {
          await onLogin(userData, authToken, captcha);
        }
        
        console.log('Login successful:', response.data);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      
      // Check for axios error response
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors object
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          // Get first error message
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error types
      if (errorMessage.toLowerCase().includes('captcha')) {
        setErrors({ captcha: errorMessage });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setErrors({ password: errorMessage });
      } else if (errorMessage.toLowerCase().includes('user') || 
                 errorMessage.toLowerCase().includes('email') || 
                 errorMessage.toLowerCase().includes('username') ||
                 errorMessage.toLowerCase().includes('not found')) {
        // If user not found error comes at final step, go back to step 1
        setCurrentStep(1);
        setErrors({ userIdAlias: 'User not found. Please check your UserID, Alias, or Email.' });
      } else if (errorMessage.toLowerCase().includes('credential')) {
        setErrors({ general: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
      
      // Refresh captcha on error
      generateCaptcha();
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
    <div className="min-h-screen bg-white bg-center bg-cover no-repeatbg"
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

          <div className="relative bg-white shadow-2xl overflow-hidden min-h-[400px] sm:min-h-[500px] flex flex-col lg:flex-row">
            
            {/* Right Panel - Login Forms */}
            <div className={`${isMobile ? 'order-1' : 'order-2'} flex-1 relative bg-gradient-white`}>
              
              {/* Step 1 - Initial Login */}
              <div className={`absolute inset-0 p-4 sm:p-8 lg:p-12 flex flex-col justify-center transition-transform duration-500 ease-in-out ${
                currentStep === 1 ? 'translate-x-0' : '-translate-x-full'
              }`}>
                <div className="w-full max-w-sm p-4 mx-auto bg-white border-2 border-purple-400 border-solid shadow-xl rounded-xl sm:p-8">
                  
                  <div className="mb-4 text-center sm:mb-8">
                    <h1 className="mb-2 text-base font-bold tracking-wider text-purple-800 sm:text-lg sm:mb-4">SMART CHECK</h1>
                    <h2 className="text-xl font-bold text-gray-800 sm:text-xl">Sign In</h2>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        UserID / AliasName / Email
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
                          placeholder="Enter userid / aliasname / email"
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
                      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-semibold text-white transition-all duration-200 bg-purple-800 rounded-sm hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          <span>Continue</span>
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
                <div className="w-full max-w-sm p-2 mx-auto bg-white border-2 border-purple-800 border-solid shadow-xl rounded-xl sm:p-6">
                  {/* Organization Header */}
                  <div className="mb-6 text-center sm:mb-8">
                    <div className="flex justify-center m-2">
                      <div className="flex items-center justify-center w-8 h-8 border-2 border-purple-800 rounded-full sm:w-12 sm:h-12">
                        <span className="text-sm font-bold text-purple-800 sm:text-sm">S-C</span>
                      </div>
                    </div>
                    <h2 className="font-semibold text-gray-800 text-md sm:text-md">SRIA</h2>
                    <p className="mt-1 text-xs text-gray-600">Welcome, {userIdAlias}</p>
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
                      <div className="text-sm text-center text-red-700 rounded">
                        {errors.general}
                      </div>
                    )}

                    <button
                      onClick={handleFinalSignIn}
                      disabled={loading}
                      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-medium text-white transition-all duration-200 bg-purple-800 rounded-sm hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
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

                    <div className="text-center">
                      <Link to="/forgot-password" className="text-sm text-gray-600 transition-colors hover:text-gray-800 hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back button for step 2 */}
              {currentStep === 2 && (
                <button
                  onClick={handleBackToStep1}
                  className="absolute p-2 text-purple-900 transition-all duration-200 rounded-sm top-4 left-4 bg-white/20 hover:bg-white/30 hover:scale-110 active:scale-95"
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