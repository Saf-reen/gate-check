import React, { useState, useMemo } from 'react';
import { FaBuilding, FaPlus, FaTimes, FaUsers, FaCalendar, FaEnvelope, FaEye, FaSearch } from 'react-icons/fa';
import AddUserModal from '../Users/AddUserModal';
import UserManagement from '../Users/UserManagement';


const Organization = ({ userProfile, user, onLogout }) => {
  const [organizations, setOrganizations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    establishedDate: ''
  });

  // Filter organizations based on search query
  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) {
      return organizations;
    }

    const query = searchQuery.toLowerCase().trim();
    return organizations.filter(org => 
      org.name.toLowerCase().includes(query)
    );
  }, [organizations, searchQuery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleAddOrganization = () => {
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
    setShowUserManagement(true);
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

  const handleUpdateOrganization = (updatedOrganization) => {
    setOrganizations(prev => prev.map(org => 
      org.id === updatedOrganization.id ? updatedOrganization : org
    ));
    setSelectedOrganization(updatedOrganization);
  };

  const handleBackToOrganizations = () => {
    setShowUserManagement(false);
    setSelectedOrganization(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If user management is shown, render the UserManagement component
  if (showUserManagement && selectedOrganization) {
    return (
      <UserManagement
        organization={selectedOrganization}
        onBack={handleBackToOrganizations}
        onUpdateOrganization={handleUpdateOrganization}
      />
    );
  }

  // Main Organizations View
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full min-h-screen lg:ml-0">
        <main className="p-0">
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

            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search Organizations.."
                  className="w-100 pl-8 text-sm h-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaTimes className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {filteredOrganizations.length === 0 
                    ? 'No organizations found' 
                    : `${filteredOrganizations.length} organization${filteredOrganizations.length !== 1 ? 's' : ''} found`
                  } for "{searchQuery}"
                </span>
                {filteredOrganizations.length > 0 && (
                  <button
                    onClick={clearSearch}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Organizations List or Empty State */}
            {filteredOrganizations.length === 0 ? (
              <div className="py-16 text-center bg-white shadow-lg rounded-xl">
                {searchQuery ? (
                  <>
                    <FaSearch className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                    <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organizations Found</h2>
                    <p className="mb-8 text-gray-600">
                      No organizations match your search for "{searchQuery}"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="px-8 py-3 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors mr-4"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-8 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Add New Organization
                    </button>
                  </>
                ) : (
                  <>
                    <FaBuilding className="w-24 h-24 mx-auto mb-6 text-green-600" />
                    <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organizations Registered</h2>
                    <p className="mb-8 text-gray-600">Get started by adding your first organization</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-8 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Add Your First Organization
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrganizations.map((org) => (
                  <div key={org.id} className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-green-600 to-yellow-100">
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
                        <FaEnvelope className="w-4 h-4 mr-3 text-green-500" />
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
                        className="flex items-center justify-center px-4 py-2 space-x-2 text-green-600 transition-colors rounded-lg bg-green-50 hover:bg-green-100"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View Users</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

            <div className="p-6">
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
                  type="button"
                  onClick={handleAddOrganization}
                  className="flex-1 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Add Organization
                </button>
              </div>
            </div>
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