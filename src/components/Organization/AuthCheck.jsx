import React from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';

const AuthCheck = ({
  isInitializing,
  isAuthenticated,
  errors,
  onLogout,
  renderLoading,
  renderMain,
}) => {
  if (isInitializing) {
    return renderLoading();
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full">
            <FaTimes className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mb-6 text-gray-600">{errors.general}</p>
          <button
            onClick={onLogout}
            className="px-6 py-2 text-white bg-purple-800 rounded-lg hover:bg-purple-900"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return renderMain();
};

export default AuthCheck;
