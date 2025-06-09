import React, { useState } from 'react';
import { FaBuilding, FaPlus, FaTimes, FaUsers, FaCalendar, FaEnvelope, FaEye, FaUser, FaPhone, FaIdBadge, FaArrowLeft } from 'react-icons/fa';
import AddUserModal from '../Users/AddUserModal';

const Organization = ({ userProfile, user, onLogout }) => {
  const [organizations, setOrganizations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    establishedDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddOrganization = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.establishedDate) {
      const newOrg = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        establishedDate: formData.establishedDate,
        users: []
      };
      setOrganizations(prev => [...prev, newOrg]);
      setFormData({ name: '', email: '', establishedDate: '' });
      setShowAddForm(false);
    }
  };

  const handleAddUser = (orgId) => {
    setSelectedOrgId(orgId);
    setShowAddUserModal(true);
  };

  const handleViewUsers = (org) => {
    setSelectedOrganization(org);
    setShowUsersList(true);
  };

  const handleUserAdded = (userData) => {
    if (selectedOrgId) {
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        employeeId: userData.employeeId,
        role: userData.role,
        dateAdded: new Date().toISOString()
      };
      
      setOrganizations(prev => prev.map(org => 
        org.id === selectedOrgId 
          ? { ...org, users: [...org.users, newUser] }
          : org
      ));
    }
    setShowAddUserModal(false);
    setSelectedOrgId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackToOrganizations = () => {
    setShowUsersList(false);
    setSelectedOrganization(null);
  };

  // Users List View Component
  const UsersListView = () => {
    if (!selectedOrganization) return null;

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToOrganizations}
              className="flex items-center px-4 py-2 space-x-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Organizations</span>
            </button>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <FaBuilding className="w-6 h-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedOrganization.name}</h1>
                <p className="text-gray-600">User Management</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleAddUser(selectedOrganization.id)}
            className="flex items-center px-6 py-3 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Organization Info Card */}
        <div className="p-6 bg-white shadow-sm rounded-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{selectedOrganization.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Established</p>
                <p className="font-medium text-gray-800">{formatDate(selectedOrganization.establishedDate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaUsers className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="font-medium text-gray-800">{selectedOrganization.users.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        {selectedOrganization.users.length === 0 ? (
          <div className="py-16 text-center bg-white shadow-sm rounded-xl">
            <FaUsers className="w-20 h-20 mx-auto mb-6 text-gray-400" />
            <h2 className="mb-4 text-xl font-semibold text-gray-800">No Users Found</h2>
            <p className="mb-8 text-gray-600">This organization doesn't have any users yet.</p>
            <button
              onClick={() => handleAddUser(selectedOrganization.id)}
              className="px-8 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              Add First User
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">User Directory</h2>
              <p className="text-sm text-gray-600">Manage organization members and their access</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedOrganization.users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                            <FaUser className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FaIdBadge className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{user.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <FaPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {user.dateAdded ? formatDateTime(user.dateAdded) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main Organizations View
  const OrganizationsView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <FaBuilding className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Organization Management</h1>
            <p className="text-gray-600">Manage your organizations and their members</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-6 py-3 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Organizations List or Empty State */}
      {organizations.length === 0 ? (
        <div className="py-16 text-center bg-white shadow-lg rounded-xl">
          <FaBuilding className="w-24 h-24 mx-auto mb-6 text-green-600" />
          <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organizations Registered</h2>
          <p className="mb-8 text-gray-600">Get started by adding your first organization</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-8 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            Add Your First Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div key={org.id} className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-900 to-blue-400">
                    <FaBuilding className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{org.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <FaUsers className="w-3 h-3 mr-1" />
                      <span>{org.users.length} members</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm">{org.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaCalendar className="w-4 h-4 mr-3 text-green-500" />
                  <span className="text-sm">Est. {formatDate(org.establishedDate)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAddUser(org.id)}
                  className="flex items-center justify-center px-4 py-2 space-x-2 text-green-600 transition-colors rounded-lg bg-green-50 hover:bg-green-100"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
                
                <button
                  onClick={() => handleViewUsers(org)}
                  className="flex items-center justify-center px-4 py-2 space-x-2 text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                >
                  <FaEye className="w-4 h-4" />
                  <span>View Users</span>
                </button>
              </div>

              {/* {org.users.length > 0 && (
                <div className="pt-4 mt-4 border-t">
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Recent Members:</h4>
                  <div className="space-y-1">
                    {org.users.slice(0, 2).map((member) => (
                      <div key={member.id} className="text-sm text-gray-600">
                        {member.name} - {member.role}
                      </div>
                    ))}
                    {org.users.length > 2 && (
                      <div className="text-sm text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewUsers(org)}>
                        +{org.users.length - 2} more members
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full min-h-screen lg:ml-0">
        <main className="p-0">
          {showUsersList ? <UsersListView /> : <OrganizationsView />}
        </main>
      </div>

      {/* Add Organization Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Add New Organization</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddOrganization} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="org@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Established Date *
                  </label>
                  <input
                    type="date"
                    name="establishedDate"
                    value={formData.establishedDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Add Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );
};

export default Organization;