import React, { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, Mail, Loader2, User } from "lucide-react";
import { axiosInstance } from "../utils/axiosInstance";
import {api} from "../Auth/api"; // Adjust the import path as necessary

const ForgotPassword = () => {
  // Local state for form inputs
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("email"); // "email", "otp", "reset"
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Password validation
  const [passwordErrors, setPasswordErrors] = useState([]);

  const forgotPasswordUrl = process.env.REACT_APP_FORGOT_PASSWORD_API;
  const verifyOtpUrl = process.env.REACT_APP_VERIFY_OTP_API;
  const resetPasswordUrl = process.env.REACT_APP_RESET_PASSWORD_API;

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Email change handler
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  // OTP change handler with number and length validation
  const handleOtpChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers and maximum 6 digits
    if (value === '' || (/^\d+$/.test(value) && value.length <= 6)) {
      setOtp(value);
      setError("");
    }
  };

  // Password change handler with validation
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    validatePassword(password);
    setError("");
  };

  // Confirm password change handler
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError("");
  };

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // // Handle Enter key press for navigation
  const handleKeyPress = (e, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (currentStep === "email") {
        if (currentField === "email") {
          handleEmailSubmit(e);
        }
      } else if (currentStep === "otp") {
        if (currentField === "otp") {
          handleOtpSubmit(e);
        }
      } else if (currentStep === "reset") {
        if (currentField === "newPassword") {
          // Focus on confirm password field
          const confirmPasswordField = document.querySelector('input[placeholder="Confirm new password"]');
          if (confirmPasswordField) {
            confirmPasswordField.focus();
          }
        } else if (currentField === "confirmPassword") {
          handlePasswordReset(e);
        }
      }
    }
  };

  // Send OTP request
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call - uncomment your actual API code
    // setTimeout(() => {
    //   setCurrentStep("otp");
    //   setResendEnabled(false);
    //   setResendTimer(30);
    //   setIsLoading(false);
    // }, 1000);

    try {
      const response = await api.auth.forgotPassword( { identifier:email });

      console.log(email)
      console.log(response);
      
      if (response.status === 200) {
        setCurrentStep("otp");
        setResendEnabled(false);
        setResendTimer(30);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.error || "Error sending OTP");
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP request
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!otp.trim()) {
      setError("OTP cannot be empty");
      return;
    }

    // Validate OTP length
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);

    // // Simulate API call - uncomment your actual API code
    // setTimeout(() => {
    //   setCurrentStep("reset");
    //   setIsLoading(false);
    // }, 1000);

    const userData={
      identifier: email.trim(), 
      otp: otp.trim() 
    }
    try {
      const response = await api.auth.verifyOtp(userData);
      console.log(userData);
      if (response.status === 200) {
        setCurrentStep("reset");
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.error || "Invalid OTP");
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password request
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");

    // Password validation
    const isPasswordValid = validatePassword(newPassword);
    if (!isPasswordValid) {
      setError("Please fix the password requirements");
      return;
    }

    // Password match validation
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setIsLoading(true);

    // Simulate success - uncomment your actual API code
    // setTimeout(() => {
    //   setError("Password reset successful! Redirecting to login...");
    //   setIsLoading(false);
    //   setTimeout(() => {
    //     window.location.href = "/login";
    //   }, 3000);
    // }, 1000);

    try {
      const response = await api.auth.newPasswod( {
        identifier: email.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      if (response.status === 200) {
        setError("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.error || "Failed to reset password");
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Back to login handler
  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (currentStep === "otp" && !resendEnabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, resendEnabled, resendTimer]);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-white">
    <div className="w-full h-full bg-white">
      <div className="flex items-center justify-center h-screen p-2 sm:p-4">
        <div className="relative w-full mx-auto overflow-hidden">
          
          {/* Background geometric shapes - responsive */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-16 h-16 transform bg-purple-200 rounded-lg top-5 left-5 sm:top-10 sm:left-10 sm:w-32 sm:h-32 opacity-30 rotate-12 animate-pulse"></div>
            <div className="absolute w-12 h-12 bg-pink-200 rounded-full top-20 right-10 sm:top-40 sm:right-20 sm:w-24 sm:h-24 opacity-40 animate-bounce"></div>
            <div className="absolute w-16 h-16 transform rounded-lg opacity-25 bottom-10 left-1/4 sm:bottom-20 sm:w-28 sm:h-28 bg-black-200 -rotate-6 animate-pulse"></div>
            <div className="absolute w-10 h-10 bg-purple-300 rounded-full top-1/3 left-1/3 sm:w-20 sm:h-20 opacity-20 animate-ping"></div>
          </div>

          <div className="relative flex flex-col min-h-screen overflow-hidden bg-white shadow-2xl sm:min-h-screen lg:flex-row">
            
            {/* Main Panel - Forgot Password Form */}
            <div className={`${isMobile ? 'order-1' : 'order-2'} flex-1 relative bg-white`}>
              
              <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-8 lg:p-12">
                <div className="w-full max-w-sm p-4 mx-auto bg-white border-2 border-purple-800 border-solid shadow-xl rounded-xl sm:p-8">
                  
                  {/* Header */}
                  <div className="mb-4 text-center sm:mb-8">
                    <h1 className="mb-2 text-base font-bold tracking-wider text-purple-800 sm:text-lg sm:mb-4">SMART CHECK</h1>
                    <h2 className="text-xl font-bold text-gray-800 sm:text-xl">Reset Password</h2>
                    <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                      {currentStep === "email" && "Enter your email to receive a reset code"}
                      {currentStep === "otp" && "Enter the verification code sent to your email"}
                      {currentStep === "reset" && "Create a new strong password"}
                    </p>
                  </div>

                  {/* Email Step */}
                  {currentStep === "email" && (
                    <div className="space-y-2 sm:space-y-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            onKeyPress={(e) => handleKeyPress(e, "email")}
                            placeholder="Enter your registered email"
                            className={`w-full px-2 py-1 border focus:ring-2 text-sm focus:ring-black-400 focus:border-transparent pr-8 transition-colors ${
                              error && error.includes("email") ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                            autoFocus
                          />
                          <Mail className="absolute right-3 top-1.5 h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      <button
                        onClick={handleEmailSubmit}
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-semibold text-white transition-all duration-200 bg-purple-800 rounded-sm hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            <span>Send Reset Code</span>
                            <span className="ml-2">→</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* OTP Step */}
                  {currentStep === "otp" && (
                    <div className="space-y-2 sm:space-y-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Verification Code <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={otp}
                            onChange={handleOtpChange}
                            onKeyPress={(e) => handleKeyPress(e, "otp")}
                            className={`w-full px-2 py-1 border focus:ring-2 text-sm focus:ring-black-400 focus:border-transparent pr-8 transition-colors ${
                              error && error.includes("OTP") ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter 6-digit code"
                            autoFocus
                          />
                          <User className="absolute right-3 top-1.5 h-4 w-4 text-gray-400" />
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          6-digit code sent to your email
                        </p>
                      </div>

                      <button
                        onClick={handleOtpSubmit}
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-semibold text-white transition-all duration-200 bg-purple-800 rounded-sm hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            <span>Verify Code</span>
                            <span className="ml-2">→</span>
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={resendEnabled ? handleEmailSubmit : null}
                          disabled={!resendEnabled || isLoading}
                          className={`text-sm transition-colors ${
                            resendEnabled && !isLoading
                              ? "text-gray-600 hover:text-gray-800 hover:underline"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {resendEnabled ? "Resend Code" : `Resend code in ${resendTimer}s`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password Reset Step */}
                  {currentStep === "reset" && (
                    <div className="space-y-2 sm:space-y-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            onKeyPress={(e) => handleKeyPress(e, "newPassword")}
                            className={`w-full px-2 py-1 border text-sm focus:ring-2 focus:ring-black-400 focus:border-transparent pr-10 transition-colors ${
                              passwordErrors.length > 0 ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                            placeholder="Enter new password"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={toggleNewPasswordVisibility}
                            className="absolute right-1 top-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordErrors.length > 0 && (
                          <div className="mt-1 space-y-1 text-xs text-red-500">
                            {passwordErrors.map((err, index) => (
                              <p key={index}>{err}</p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            onKeyPress={(e) => handleKeyPress(e, "confirmPassword")}
                            className={`w-full px-2 py-1 border text-sm focus:ring-2 focus:ring-black-400 focus:border-transparent pr-10 transition-colors ${
                              error && error.includes("match") ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isLoading}
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-1 top-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handlePasswordReset}
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-semibold text-white transition-all duration-200 bg-purple-800 rounded-sm hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            <span>Reset Password</span>
                            <span className="ml-2">→</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div 
                      className={`text-center p-1 text-sm mt-2 ${
                        error.includes("successful") 
                          ? "text-purple-800 bg-purple-50 rounded" 
                          : "text-red-500"
                      }`}
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {/* Back to Login */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleBackToLogin}
                      className="flex items-center justify-center mx-auto space-x-1 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-800 hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Login</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Back button for navigation between steps */}
              {(currentStep === "otp" || currentStep === "reset") && (
                <button
                  onClick={() => {
                    if (currentStep === "otp") {
                      setCurrentStep("email");
                    } else if (currentStep === "reset") {
                      setCurrentStep("otp");
                    }
                    setError("");
                  }}
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
    </div>
  );
};

export default ForgotPassword;