import React from 'react';
import { Save, X, Loader } from 'lucide-react';

const RoleModal = ({ isOpen, onClose, title, role, onChange, onSubmit, submitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        {role && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Role Name
              </label>
              <input
                type="text"
                value={role.name}
                onChange={(e) => onChange({ ...role, name: e.target.value })}
                placeholder="Enter role name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={role.is_active}
                  onChange={(e) => onChange({ ...role, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex justify-end pt-4 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-purple-800 bg-transparent border border-purple-800 rounded-lg hover:bg-purple-100 disabled:opacity-50"
              >
                {submitting ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleModal;
