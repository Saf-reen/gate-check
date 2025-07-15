import React from 'react';
import { FaBuilding, FaUsers, FaMapMarkerAlt, FaEdit, FaTrash, FaPlus, FaEye, FaSpinner, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const OrganizationList = ({
  organizations,
  searchQuery,
  loading,
  userDataLoading,
  onEditOrganization,
  onDeleteOrganization,
  onAddUser,
}) => {
  const navigate = useNavigate();

  const handleViewUsers = (org) => {
    navigate('/user', { state: { organization: org } });
  };

  if (organizations.length === 0) {
    return (
      <div className="py-16 text-center bg-white shadow-lg rounded-xl">
        {searchQuery ? (
          <>
            <FaSearch className="w-24 h-24 mx-auto mb-6 text-gray-400" />
            <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organizations Found</h2>
            <p className="mb-8 text-gray-600">
              No organizations match your search for "{searchQuery}"
            </p>
            <button
              onClick={() => {}}
              className="px-8 py-3 mr-4 text-purple-800 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100"
            >
              Clear Search
            </button>
          </>
        ) : (
          <>
            <FaBuilding className="w-24 h-24 mx-auto mb-6 text-purple-800" />
            <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organizations Registered</h2>
            <p className="mb-8 text-gray-600">Get started by adding your first organization</p>
            <button
              onClick={() => {}}
              className="px-8 py-3 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100"
            >
              Add Your First Organization
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => {
        const userCount = org.userCount || (org.users || []).length;
        return (
          <div key={org.id} className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-white border border-purple-800 rounded-lg">
                  <FaBuilding className="w-6 h-6 text-purple-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{org.company_name}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <FaUsers className="w-3 h-3 mr-1" />
                    <span>{userCount} {userCount === 1 ? 'member' : 'members'}</span>
                    {userDataLoading && (
                      <FaSpinner className="w-3 h-3 ml-2 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditOrganization(org)}
                  className="text-blue-900 transition-colors rounded-lg hover:bg-blue-50"
                  title="Edit Organization"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteOrganization(org)}
                  className="text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Delete Organization"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mb-6 space-y-3">
              {org.location && (
                <div className="flex items-start text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4 mr-3 mt-0.5 text-purple-500 flex-shrink-0" />
                  <div className="text-sm">
                    <div>{org.location}</div>
                    {org.pin_code && (
                      <div className="text-gray-500">PIN: {org.pin_code}</div>
                    )}
                  </div>
                </div>
              )}
              {org.address && (
                <div className="flex items-start text-gray-600">
                  <div className="w-4 h-4 mr-3 mt-0.5"></div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {org.address}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onAddUser(org.id)}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 space-x-2 text-purple-800 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={() => handleViewUsers(org)}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 space-x-2 text-purple-800 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaEye className="w-4 h-4" />
                <span>View Users</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrganizationList;
