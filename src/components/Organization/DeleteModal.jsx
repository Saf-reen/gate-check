import React from 'react';
import { FaExclamationTriangle, FaSpinner, FaTrash } from 'react-icons/fa';

const DeleteModal = ({ organizationName, onCancel, onConfirm, loading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <FaExclamationTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-center text-gray-800">
            Delete Organization
          </h3>
          <p className="mb-6 text-center text-gray-600">
            Are you sure you want to delete "{organizationName}"?
            This action cannot be undone and will remove all associated data.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center px-6 py-2 space-x-2 text-red-600 transition-colors bg-white border border-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaTrash className="w-4 h-4" />
              )}
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
