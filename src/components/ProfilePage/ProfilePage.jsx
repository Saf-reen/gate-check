import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { api } from '../Auth/api';
import ProfileHeader from './ProfileHeader';
import ProfileSecurity from './ProfileSecurity';
import ProfileInformation from './ProfileInformation';
import PasswordChangeModal from './PasswordChangeModal';

const ProfilePage = ({ user: propUser, onLogout, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [sessionWarning, setSessionWarning] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    aliasName: '',
    email: '',
    mobile: ''
  });

  const [profileData, setProfileData] = useState({
    companyName: '',
    userName: '',
    userId: '',
    email: '',
    mobile: '',
    aliasName: '',
    blockBuilding: '',
    floor: '',
    address: '',
    location: '',
    pinCode: ''
  });

  const getFieldValue = (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `No data found for ${fieldName}`;
    }
    return value;
  };

  const getDisplayValue = (value) => {
    if (value == null) return '';
    const stringValue = String(value);
    return stringValue.trim() !== '' ? stringValue.trim() : '';
  };

  const getCurrentUser = () => {
    return userData || propUser || {};
  };

  const clearMessages = () => {
    setErrors({});
    setSuccess('');
    setSessionWarning('');
  };

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token has expired');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const checkInitialization = () => {
    const token = localStorage.getItem('authToken');
    if (!token || !isTokenValid(token)) {
      setIsAuthenticated(false);
      setIsInitializing(false);
    } else {
      setIsAuthenticated(true);
      setIsInitializing(false);
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingUserData(true);
    try {
      const token = localStorage.getItem('authToken');
      let response;
      try {
        response = await api.user.getProfile();
        console.log('User profile fetched successfully:', response.data);
      } catch (userError) {
        try {
          response = await api.auth.getProfile();
        } catch (authError) {
          console.error('Failed to fetch user data:', authError);
        }
      }

      if (response?.data) {
        const fetchedUserData = response.data;
        console.log('User data fetched successfully:', fetchedUserData);
        setUserData(fetchedUserData);
        updateProfileDataFromUser(fetchedUserData);
        if (onProfileUpdate) {
          onProfileUpdate(fetchedUserData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      if (error.response?.status !== 401) {
        const errorMessage = handleApiError(error, 'Fetch user data');
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoadingUserData(false);
    }
  }, [isAuthenticated, onProfileUpdate]);

  const updateProfileDataFromUser = useCallback((user) => {
    if (!user) return;
    const updatedProfileData = {
      companyName: getDisplayValue(user.company?.company_name || user.company || user.organization),
      userName: getDisplayValue(user.name || user.userName || user.username || user.fullName),
      userId: getDisplayValue(user.user_id || user.id || user.userIdAlias || user.employeeId),
      email: getDisplayValue(user.email),
      mobile: getDisplayValue(user.mobile_number || user.phone || user.phoneNumber),
      aliasName: getDisplayValue(user.alias_name || user.alias || user.displayName),
      blockBuilding: getDisplayValue(user.blockBuilding || user.building || user.block),
      floor: getDisplayValue(user.floor),
      address: getDisplayValue(user.company?.address),
      location: getDisplayValue(user.company?.location || user.city),
      pinCode: getDisplayValue(user.company?.pin_code || user.zipCode || user.postalCode)
    };

    setProfileData(updatedProfileData);
    setFormData(prev => ({
      ...prev,
      aliasName: updatedProfileData.aliasName,
      email: updatedProfileData.email,
      mobile: updatedProfileData.mobile
    }));
  }, []);

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    checkInitialization();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      fetchUserData();
    }
  }, [isAuthenticated, isInitializing, fetchUserData]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && Object.keys(currentUser).length > 0) {
      updateProfileDataFromUser(currentUser);
    }
  }, [propUser, userData, updateProfileDataFromUser]);

  const handleApiError = useCallback((error, operation) => {
    console.error(`${operation} error:`, error);
    if (error.response?.status === 401) {
      return 'Authentication failed. Please login again.';
    }
    let errorMessage = `Failed to ${operation.toLowerCase()}. Please try again.`;
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (typeof errors === 'object') {
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return errorMessage;
  }, []);

  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { isValid: false, error: 'Email is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true, error: null };
  };

  const validateMobile = (mobile) => {
    const trimmedMobile = mobile.trim();
    if (!trimmedMobile) {
      return { isValid: false, error: 'Mobile number is required' };
    }
    const digitsOnly = trimmedMobile.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(digitsOnly[0])) {
      return { isValid: false, error: 'Please enter a valid mobile number' };
    }
    return { isValid: true, error: null };
  };

  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long' };
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      };
    }
    return { isValid: true, error: null };
  };

  const handlePasswordChange = async () => {
    clearMessages();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setErrors({ password: 'All password fields are required' });
      return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setErrors({ password: 'New password must be different from current password' });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ password: 'New password and confirm password do not match' });
      return;
    }
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.error });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const passwordPayload = {
        old_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
        access_token: token
      };
      const response = await api.auth.changePassword(passwordPayload);
      if (response.data) {
        setSuccess('Password updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setIsEditingPassword(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Password change');
      if (errorMessage.toLowerCase().includes('current password') || errorMessage.toLowerCase().includes('incorrect password')) {
        setErrors({ password: 'Current password is incorrect' });
      } else if (errorMessage.toLowerCase().includes('weak password') || errorMessage.toLowerCase().includes('password strength')) {
        setErrors({ password: errorMessage });
      } else {
        setErrors({ password: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAliasChange = async () => {
    clearMessages();
    if (!formData.aliasName.trim()) {
      setErrors({ alias: 'Alias name cannot be empty' });
      return;
    }
    if (formData.aliasName.trim().length < 2) {
      setErrors({ alias: 'Alias name must be at least 2 characters long' });
      return;
    }
    setLoading(true);
    try {
      const aliasPayload = { aliasName: formData.aliasName.trim() };
      let response;
      try {
        response = await api.auth.updateProfile(aliasPayload);
      } catch (authError) {
        response = await api.user.updateProfile(aliasPayload);
      }
      if (response.data) {
        const updatedAlias = response.data.aliasName || formData.aliasName;
        setProfileData(prev => ({ ...prev, aliasName: updatedAlias }));
        setSuccess('Alias name updated successfully!');
        setIsEditingAlias(false);
        if (userData) {
          setUserData(prev => ({ ...prev, aliasName: updatedAlias }));
        }
        if (onProfileUpdate) {
          onProfileUpdate({ ...getCurrentUser(), aliasName: updatedAlias });
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Alias update');
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
        setErrors({ alias: 'This alias name is already taken. Please choose another.' });
      } else if (errorMessage.toLowerCase().includes('invalid characters')) {
        setErrors({ alias: 'Alias name contains invalid characters' });
      } else {
        setErrors({ alias: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    clearMessages();
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error });
      return;
    }
    setLoading(true);
    try {
      const emailPayload = { email: formData.email.trim() };
      let response;
      try {
        response = await api.user.updateProfile(emailPayload);
      } catch (userError) {
        response = await api.auth.updateProfile(emailPayload);
      }
      if (response.data) {
        const updatedEmail = response.data.email || formData.email;
        setProfileData(prev => ({ ...prev, email: updatedEmail }));
        setSuccess('Email updated successfully! Verification email sent.');
        setIsEditingEmail(false);
        if (userData) {
          setUserData(prev => ({ ...prev, email: updatedEmail }));
        }
        if (onProfileUpdate) {
          onProfileUpdate({ ...getCurrentUser(), email: updatedEmail });
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Email update');
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already registered')) {
        setErrors({ email: 'This email is already registered. Please use a different email.' });
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        setErrors({ email: 'Please enter a valid email address' });
      } else {
        setErrors({ email: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = async () => {
    clearMessages();
    const mobileValidation = validateMobile(formData.mobile);
    if (!mobileValidation.isValid) {
      setErrors({ mobile: mobileValidation.error });
      return;
    }
    setLoading(true);
    try {
      const mobilePayload = { mobile: formData.mobile.trim() };
      let response;
      try {
        response = await api.user.updateProfile(mobilePayload);
      } catch (userError) {
        response = await api.auth.updateProfile(mobilePayload);
      }
      if (response.data) {
        const updatedMobile = response.data.mobile || formData.mobile;
        setProfileData(prev => ({ ...prev, mobile: updatedMobile }));
        setSuccess('Mobile number updated successfully!');
        setIsEditingMobile(false);
        if (userData) {
          setUserData(prev => ({ ...prev, mobile: updatedMobile }));
        }
        if (onProfileUpdate) {
          onProfileUpdate({ ...getCurrentUser(), mobile: updatedMobile });
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Mobile update');
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already registered')) {
        setErrors({ mobile: 'This mobile number is already registered. Please use a different number.' });
      } else if (errorMessage.toLowerCase().includes('invalid mobile')) {
        setErrors({ mobile: 'Please enter a valid mobile number' });
      } else {
        setErrors({ mobile: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (field) => {
    clearMessages();
    switch (field) {
      case 'password':
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setIsEditingPassword(false);
        break;
      case 'alias':
        setFormData(prev => ({ ...prev, aliasName: profileData.aliasName }));
        setIsEditingAlias(false);
        break;
      case 'email':
        setFormData(prev => ({ ...prev, email: profileData.email }));
        setIsEditingEmail(false);
        break;
      case 'mobile':
        setFormData(prev => ({ ...prev, mobile: profileData.mobile }));
        setIsEditingMobile(false);
        break;
    }
  };

  const handleLogoutClick = async () => {
    try {
      setLoading(true);
      try {
        await api.auth.logout();
      } catch (logoutError) {
        console.warn('Logout API call failed:', logoutError);
      }
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      if (onLogout) {
        onLogout();
      }
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      if (onLogout) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-600 animate-spin" />
          <p className="text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen m-0 bg-gray-50">
      <ProfileHeader isLoadingUserData={isLoadingUserData} refreshUserData={refreshUserData} />
      <div className="max-w-6xl p-6 mx-auto">
        {isLoadingUserData && (
          <div className="flex items-center p-4 mb-6 border border-blue-200 rounded-md bg-blue-50">
            <Loader2 className="w-5 h-5 mr-3 text-blue-600 animate-spin" />
            <p className="font-medium text-blue-800">Loading user profile data...</p>
          </div>
        )}
        {sessionWarning && (
          <div className="flex items-center p-4 mb-6 border border-orange-200 rounded-md bg-orange-50">
            <AlertCircle className="w-5 h-5 mr-3 text-orange-600" />
            <p className="font-medium text-orange-800">{sessionWarning}</p>
          </div>
        )}
        {success && (
          <div className="p-2 mb-6 border border-green-200 rounded-md bg-green-50">
            <p className="font-medium text-green-800">{success}</p>
          </div>
        )}
        {errors.general && (
          <div className="flex items-center mb-2 rounded-md">
            <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
            <p className="font-medium text-red-800">{errors.general}</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ProfileSecurity
            loading={loading}
            isAuthenticated={isAuthenticated}
            setIsEditingPassword={setIsEditingPassword}
            setIsEditingAlias={setIsEditingAlias}
            handleLogoutClick={handleLogoutClick}
            profileData={profileData}
            getFieldValue={getFieldValue}
          />
          <ProfileInformation
            profileData={profileData}
            formData={formData}
            isEditingAlias={isEditingAlias}
            isEditingEmail={isEditingEmail}
            isEditingMobile={isEditingMobile}
            loading={loading}
            errors={errors}
            setIsEditingAlias={setIsEditingAlias}
            setIsEditingEmail={setIsEditingEmail}
            setIsEditingMobile={setIsEditingMobile}
            handleAliasChange={handleAliasChange}
            handleEmailChange={handleEmailChange}
            handleMobileChange={handleMobileChange}
            handleCancel={handleCancel}
            setFormData={setFormData}
            getFieldValue={getFieldValue}
          />
        </div>
        <PasswordChangeModal
          isEditingPassword={isEditingPassword}
          formData={formData}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          loading={loading}
          errors={errors}
          setShowCurrentPassword={setShowCurrentPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          handlePasswordChange={handlePasswordChange}
          handleCancel={handleCancel}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
