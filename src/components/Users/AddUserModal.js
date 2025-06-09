import React, { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaIdBadge, FaBuilding, FaLayerGroup } from 'react-icons/fa';

const AddUserModal = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    role: '',
    companyName: '',
    userId: '',
    aliasname: '',
    blockBuilding: '',
    floor: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'User name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUserAdded(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-green-400">
              <FaUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
              <p className="text-sm text-gray-600">Fill in the user information below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaBuilding className="w-4 h-4 text-green-500" />
                <span>Company Name *</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            {/* User Name */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaUser className="w-4 h-4 text-green-500" />
                <span>User Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* User ID */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaIdBadge className="w-4 h-4 text-green-500" />
                <span>User ID *</span>
              </label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.userId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter user ID"
              />
              {errors.userId && (
                <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
              )}
            </div>

            {/* Email ID */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaEnvelope className="w-4 h-4 text-green-500" />
                <span>Email ID *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaPhone className="w-4 h-4 text-green-500" />
                <span>Mobile Number *</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Alias Name */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaUser className="w-4 h-4 text-gray-400" />
                <span>Alias Name (Optional)</span>
              </label>
              <input
                type="text"
                name="aliasname"
                value={formData.aliasname}
                onChange={handleInputChange}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter alias name"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaIdBadge className="w-4 h-4 text-green-500" />
                <span>Employee ID *</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.employeeId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="EMP001"
              />
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>

            {/* Block/Building */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaBuilding className="w-4 h-4 text-gray-400" />
                <span>Block/Building</span>
              </label>
              <input
                type="text"
                name="blockBuilding"
                value={formData.blockBuilding}
                onChange={handleInputChange}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Block A, Building 1"
              />
            </div>

            {/* Floor */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaLayerGroup className="w-4 h-4 text-gray-400" />
                <span>Floor</span>
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1st Floor, 2nd Floor"
              />
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaUser className="w-4 h-4 text-green-500" />
                <span>Role *</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="HR">HR</option>
                <option value="IT Support">IT Support</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;