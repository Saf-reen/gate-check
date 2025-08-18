import React from 'react';
import { Building, User, Mail, Phone, MapPin, Edit2, Loader2, Save, X } from 'lucide-react';

const ProfileInformation = ({
  profileData,
  formData,
  isEditingAlias,
  isEditingEmail,
  isEditingMobile,
  loading,
  errors,
  setIsEditingAlias,
  setIsEditingEmail,
  setIsEditingMobile,
  handleAliasChange,
  handleEmailChange,
  handleMobileChange,
  handleCancel,
  setFormData,
  getFieldValue
}) => {
  return (
    <div className="lg:col-span-2">
      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800">Profile Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 mr-2" />
                Role
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.role, 'role')}
              </p>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Building className="w-4 h-4 mr-2" />
                Company Name
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.companyName, 'company name')}
              </p>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 mr-2" />
                User Name
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.userName, 'user name')}
              </p>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 mr-2" />
                User ID
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.userId, 'user ID')}
              </p>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 mr-2" />
                Alias Name
              </label>
              {/* {isEditingAlias ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.aliasName}
                    onChange={(e) => setFormData(prev => ({ ...prev, aliasName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter alias name"
                  />
                  {errors.alias && (
                    <p className="text-sm text-red-600">{errors.alias}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAliasChange}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm text-green-800 bg-white border border-green-800 rounded hover:bg-green-100 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel('alias')}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : ( */}
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                  <span className="text-gray-800">
                    {getFieldValue(profileData.aliasName, 'alias name')}
                  </span>
                  <button
                    onClick={() => setIsEditingAlias(true)}
                    disabled={loading}
                    className="p-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                  >
                    {/* <Edit2 className="w-4 h-4" /> */}
                  </button>
                </div>
              {/* )} */}
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </label>
              {/* {isEditingEmail ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEmailChange}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm text-green-800 bg-white border border-green-800 rounded hover:bg-green-100 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel('email')}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : ( */}
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                  <span className="text-gray-800">
                    {getFieldValue(profileData.email, 'email')}
                  </span>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    disabled={loading}
                    className="p-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                  >
                    {/* <Edit2 className="w-4 h-4" /> */}
                  </button>
                </div>
              {/* )} */}
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4 mr-2" />
                Mobile Number
              </label>
              {/* {isEditingMobile ? (
                <div className="space-y-2">
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter mobile number"
                  />
                  {errors.mobile && (
                    <p className="text-sm text-red-600">{errors.mobile}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleMobileChange}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm text-green-800 bg-white border border-green-800 rounded hover:bg-green-100 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel('mobile')}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : ( */}
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                  <span className="text-gray-800">
                    {getFieldValue(profileData.mobile, 'mobile number')}
                  </span>
                  <button
                    onClick={() => setIsEditingMobile(true)}
                    disabled={loading}
                    className="p-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                  >
                    {/* <Edit2 className="w-4 h-4" /> */}
                  </button>
                </div>
              {/* )} */}
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Building className="w-4 h-4 mr-2" />
                Block/Building
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.blockBuilding, 'block/building')}
              </p>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Building className="w-4 h-4 mr-2" />
                Floor
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.floor, 'floor')}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 mr-2" />
                Address
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.address, 'address')}
              </p>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.location, 'location')}
              </p>
            </div>
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 mr-2" />
                Pin Code
              </label>
              <p className="p-3 text-gray-800 bg-gray-100 rounded-md">
                {getFieldValue(profileData.pinCode, 'pin code')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
