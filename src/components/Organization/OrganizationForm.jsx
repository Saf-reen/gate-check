import React from 'react';
import { FaTimes, FaSpinner, FaPlus, FaEdit } from 'react-icons/fa';

const OrganizationForm = ({
  formData,
  errors,
  loading,
  onInputChange,
  onSubmit,
  onCancel,
  title,
  submitText
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.company_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter organization name"
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                PIN Code *
              </label>
              <input
                type="text"
                name="pin_code"
                value={formData.pin_code}
                onChange={onInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.pin_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 6-digit PIN code"
                maxLength="6"
              />
              {errors.pin_code && (
                <p className="mt-1 text-sm text-red-600">{errors.pin_code}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={onInputChange}
                rows="3"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter complete address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
          </div>
          {errors.general && (
            <div className="p-4 mt-4 border border-red-300 rounded-lg bg-red-50">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="flex items-center px-6 py-2 space-x-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : submitText.includes('Add') ? (
                <FaPlus className="w-4 h-4" />
              ) : (
                <FaEdit className="w-4 h-4" />
              )}
              <span>{submitText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationForm;
