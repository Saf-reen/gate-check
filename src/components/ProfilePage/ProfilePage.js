import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Edit2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Lock,
  LogOut,
  RefreshCw
} from 'lucide-react';

const Profile = ({ user, onLogout, onProfileUpdate }) => {
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

  // Helper function to display field value or "No data found for this field"
  const getFieldValue = (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `No data found for ${fieldName}`;
    }
    return value;
  };

  // Helper function to get display value with fallback
  const getDisplayValue = (value) => {
    return value && value.trim() !== '' ? value : '';
  };

  // Form states - using actual user data
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    aliasName: getDisplayValue(user?.aliasName || user?.alias),
    email: getDisplayValue(user?.email),
    mobile: getDisplayValue(user?.mobile || user?.phone)
  });

  // Profile data from logged in user
  const [profileData, setProfileData] = useState({
    companyName: getDisplayValue(user?.companyName || user?.company || user?.organization),
    userName: getDisplayValue(user?.name || user?.userName || user?.username),
    userId: getDisplayValue(user?.userId || user?.id || user?.userIdAlias),
    email: getDisplayValue(user?.email),
    mobile: getDisplayValue(user?.mobile || user?.phone),
    aliasName: getDisplayValue(user?.aliasName || user?.alias),
    blockBuilding: getDisplayValue(user?.blockBuilding || user?.building),
    floor: getDisplayValue(user?.floor),
    address: getDisplayValue(user?.address),
    location: getDisplayValue(user?.location || user?.city),
    pinCode: getDisplayValue(user?.pinCode || user?.zipCode || user?.postalCode)
  });

  const clearMessages = () => {
    setErrors({});
    setSuccess('');
  };

  const handlePasswordChange = async () => {
    clearMessages();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setErrors({ password: 'All password fields are required' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ password: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrors({ password: 'New password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Password updated successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setIsEditingPassword(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors({ password: 'Failed to update password. Please try again.' });
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

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(prev => ({ ...prev, aliasName: formData.aliasName }));
      setSuccess('Alias name updated successfully!');
      setIsEditingAlias(false);
      
      // Update parent component if callback provided
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, aliasName: formData.aliasName });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors({ alias: 'Failed to update alias name. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    clearMessages();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(prev => ({ ...prev, email: formData.email }));
      setSuccess('Email updated successfully! Verification email sent.');
      setIsEditingEmail(false);
      
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, email: formData.email });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors({ email: 'Failed to update email. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = async () => {
    clearMessages();
    
    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.mobile.trim() || !mobileRegex.test(formData.mobile.replace(/\D/g, ''))) {
      setErrors({ mobile: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(prev => ({ ...prev, mobile: formData.mobile }));
      setSuccess('Mobile number updated successfully!');
      setIsEditingMobile(false);
      
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, mobile: formData.mobile });
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setErrors({ mobile: 'Failed to update mobile number. Please try again.' });
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

  const handleLogout = () => {
    // Check if onLogout is provided and is a function
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      // Fallback: Clear any stored user data and navigate to login
      console.warn('onLogout function not provided to Profile component');
      // If you're using localStorage for user data, clear it here
      // localStorage.removeItem('user');
      // localStorage.removeItem('authToken');
    }
    
    // Always navigate to login page
    navigate('/login');
  };

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      const updatedProfileData = {
        companyName: getDisplayValue(user.companyName || user.company || user.organization),
        userName: getDisplayValue(user.name || user.userName || user.username),
        userId: getDisplayValue(user.userId || user.id || user.userId),
        email: getDisplayValue(user.email),
        mobile: getDisplayValue(user.mobile || user.phone),
        aliasName: getDisplayValue(user.aliasName || user.alias),
        blockBuilding: getDisplayValue(user.blockBuilding || user.building),
        floor: getDisplayValue(user.floor),
        address: getDisplayValue(user.address),
        location: getDisplayValue(user.location || user.city),
        pinCode: getDisplayValue(user.pinCode || user.zipCode || user.postalCode)
      };
      
      setProfileData(updatedProfileData);
      setFormData(prev => ({
        ...prev,
        aliasName: updatedProfileData.aliasName,
        email: updatedProfileData.email,
        mobile: updatedProfileData.mobile
      }));
    }
  }, [user]);

  // Get user's first initial for avatar
  const getUserInitial = () => {
    const name = profileData.userName || profileData.userId || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen m-0 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center p-6">
          <User className="w-8 h-8 mr-3 text-green-600" />
          <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
        </div>
      </div>

      <div className="max-w-6xl p-6 mx-auto">
        {/* Success Message */}
        {success && (
          <div className="p-4 mb-6 border border-green-200 rounded-md bg-green-50">
            <p className="font-medium text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Profile Header with Background */}
              <div className="relative h-32 bg-gradient-to-t from-green-600 to-yellow-100">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute transform -translate-x-1/2 -bottom-12 left-1/2">
                  <div className="w-24 h-24 p-1 bg-white rounded-full shadow-lg">
                    <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-b from-green-600 to-yellow-100">
                      <span className="text-2xl font-bold text-white">
                        {getUserInitial()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pt-16 pb-6 text-center">
                <h2 className="mb-1 text-xl font-semibold text-gray-800">
                  {getFieldValue(profileData.userName, 'user name')}
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  {getFieldValue(profileData.companyName, 'company name')}
                </p>
              </div>

              {/* Security Section */}
              <div className="px-6 pb-6">
                <h3 className="mb-4 text-lg font-medium text-gray-800">Security</h3>
                
                {/* Change Password */}
                <div className="mb-4">
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="flex items-center w-full p-3 text-left transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    <Lock className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700">Change Password</p>
                      <p className="text-sm text-green-600">Password</p>
                    </div>
                  </button>
                </div>

                {/* Change Alias Name */}
                <div className="mb-4">
                  <button
                    onClick={() => setIsEditingAlias(true)}
                    className="flex items-center w-full p-3 text-left transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    <User className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700">Change Aliasname</p>
                      <p className="text-sm text-green-600">Aliasname</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="mb-6 text-xl font-semibold text-gray-800">Profile</h3>

              <div className="space-y-6">
                {/* Company Name */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <Building className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Company Name</p>
                    <p className="text-gray-900">{getFieldValue(profileData.companyName, 'company name')}</p>
                  </div>
                </div>

                {/* User Name */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">User Name</p>
                    <p className="text-gray-900">{getFieldValue(profileData.userName, 'user name')}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">User ID</p>
                    <p className="text-gray-900">{getFieldValue(profileData.userId, 'user ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">You can use this as User ID</p>
                  </div>
                </div>

                {/* Email ID */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <Mail className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Email ID</p>
                    {isEditingEmail ? (
                      <div className="mt-2">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter email address"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                        <div className="flex mt-2 space-x-2">
                          <button
                            onClick={handleEmailChange}
                            disabled={loading}
                            className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                            Save
                          </button>
                          <button
                            onClick={() => handleCancel('email')}
                            className="flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900">{getFieldValue(profileData.email, 'email')}</p>
                        <button
                          onClick={() => setIsEditingEmail(true)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Mobile Number (Optional)</p>
                    {isEditingMobile ? (
                      <div className="mt-2">
                        <input
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter mobile number"
                        />
                        {errors.mobile && (
                          <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                        )}
                        <div className="flex mt-2 space-x-2">
                          <button
                            onClick={handleMobileChange}
                            disabled={loading}
                            className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                            Save
                          </button>
                          <button
                            onClick={() => handleCancel('mobile')}
                            className="flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900">{getFieldValue(profileData.mobile, 'mobile number')}</p>
                        <button
                          onClick={() => setIsEditingMobile(true)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alias Name */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Aliasname (Optional)</p>
                    {isEditingAlias ? (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={formData.aliasName}
                          onChange={(e) => setFormData(prev => ({ ...prev, aliasName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter alias name"
                        />
                        {errors.alias && (
                          <p className="mt-1 text-sm text-red-500">{errors.alias}</p>
                        )}
                        <div className="flex mt-2 space-x-2">
                          <button
                            onClick={handleAliasChange}
                            disabled={loading}
                            className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                            Save
                          </button>
                          <button
                            onClick={() => handleCancel('alias')}
                            className="flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900">{getFieldValue(profileData.aliasName, 'alias name')}</p>
                    )}
                  </div>
                </div>

                {/* Block/Building */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <Building className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Block/Building</p>
                    <p className="text-gray-900">{getFieldValue(profileData.blockBuilding, 'block/building')}</p>
                  </div>
                </div>

                {/* Floor */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                    <Building className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Floor</p>
                    <p className="text-gray-900">{getFieldValue(profileData.floor, 'floor')}</p>
                  </div>
                </div>

                {/* Address Section */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="mb-4 text-lg font-medium text-gray-800">Address Information</h4>
                  
                  {/* Address */}
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <p className="text-gray-900">{getFieldValue(profileData.address, 'address')}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center mb-4 space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{getFieldValue(profileData.location, 'location')}</p>
                    </div>
                  </div>

                  {/* Pin Code */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Pin Code</p>
                      <p className="text-gray-900">{getFieldValue(profileData.pinCode, 'pin code')}</p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center px-4 py-3 text-white transition-colors bg-green-600 rounded-lg w-100 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal/Overlay */}
        {isEditingPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                <button
                  onClick={() => handleCancel('password')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}

                <div className="flex pt-4 space-x-3">
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="flex items-center justify-center flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Update Password
                  </button>
                  <button
                    onClick={() => handleCancel('password')}
                    className="flex items-center justify-center flex-1 px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;