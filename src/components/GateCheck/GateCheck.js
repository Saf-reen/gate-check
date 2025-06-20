import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, FileText, Plus, MoreVertical, Phone, Clock, User, Users, Upload, Download, ChevronDown, X, Calendar, MapPin, Car, Mail, Building2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../Auth/api';

const GateCheck = ({ onVisitorCountChange }) => {
  const [visitors, setVisitors] = useState([]);
  const [recurringVisitors, setRecurringVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExcelDropdown, setShowExcelDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: '',
    hostName: '',
    department: '',
    company: '',
    address: '',
    belongings: '',
    vehicleType: '',
    vehicleNo: '',
    visitingDate: '',
    visitingTime: '',
    allowingHours: '6',
    category: 'NA',
    recurringType: 'onetime',
    gender: ''
  });

  // Load visitors data from backend
  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch regular visitors
      const visitorsResponse = await api.visitors.getAll();
      if (visitorsResponse.data) {
        setVisitors(visitorsResponse.data.visitors || visitorsResponse.data);
      }

      // Fetch recurring visitors
      const recurringResponse = await api.visitors.getRecurring();
      if (recurringResponse.data) {
        setRecurringVisitors(recurringResponse.data.visitors || recurringResponse.data);
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setErrors({ general: 'Failed to load visitors data. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // Pass visitor count to parent component whenever visitors change
  useEffect(() => {
    if (onVisitorCountChange) {
      onVisitorCountChange(visitors.length);
    }
  }, [visitors, onVisitorCountChange]);

  // Filter visitors based on search, status, and type
  useEffect(() => {
    let filtered = showRecurring ? recurringVisitors : visitors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(visitor =>
        visitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.phone?.includes(searchTerm) ||
        visitor.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.hostName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status (only for regular visitors)
    if (filterStatus !== 'all' && !showRecurring) {
      filtered = filtered.filter(visitor => visitor.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(visitor => visitor.type === filterType);
    }

    setFilteredVisitors(filtered);
  }, [searchTerm, filterStatus, filterType, visitors, recurringVisitors, showRecurring]);

  // Validation functions similar to LoginForm
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) {
      return { isValid: false, error: 'Please enter mobile number' };
    }
    if (!phoneRegex.test(phone.trim())) {
      return { isValid: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    return { isValid: true, error: null };
  };

  const validateEmail = (email) => {
    if (!email.trim()) return { isValid: true, error: null }; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true, error: null };
  };

  const validateRequired = (value, fieldName) => {
    if (!value.trim()) {
      return { isValid: false, error: `Please enter ${fieldName}` };
    }
    return { isValid: true, error: null };
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    const nameValidation = validateRequired(formData.name, 'visitor name');
    if (!nameValidation.isValid) newErrors.name = nameValidation.error;

    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) newErrors.phone = phoneValidation.error;

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) newErrors.email = emailValidation.error;

    const dateValidation = validateRequired(formData.visitingDate, 'visiting date');
    if (!dateValidation.isValid) newErrors.visitingDate = dateValidation.error;

    // Validate visiting date is not in the past (except today)
    const selectedDate = new Date(formData.visitingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.visitingDate = 'Visiting date cannot be in the past';
    }

    // Validate purpose
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please enter purpose of visit';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      purpose: '',
      hostName: '',
      department: '',
      company: '',
      address: '',
      belongings: '',
      vehicleType: '',
      vehicleNo: '',
      visitingDate: '',
      visitingTime: '',
      allowingHours: '6',
      category: 'NA',
      recurringType: 'onetime',
      gender: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Prepare payload for API
      const visitorPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        purpose: formData.purpose.trim(),
        hostName: formData.hostName.trim(),
        department: formData.department.trim(),
        company: formData.company.trim() || null,
        address: formData.address.trim() || null,
        belongings: formData.belongings.trim() || null,
        vehicleType: formData.vehicleType || null,
        vehicleNo: formData.vehicleNo.trim() || null,
        visitingDate: formData.visitingDate,
        visitingTime: formData.visitingTime || null,
        allowingHours: parseInt(formData.allowingHours),
        category: formData.category,
        gender: formData.gender || null,
        isRecurring: formData.recurringType === 'recurring'
      };

      console.log('Submitting visitor data:', visitorPayload);

      // Choose appropriate API endpoint based on recurring type
      let response;
      if (formData.recurringType === 'recurring') {
        response = await api.visitors.createRecurring(visitorPayload);
      } else {
        response = await api.visitors.create(visitorPayload);
      }

      if (response.data) {
        const newVisitor = response.data.visitor || response.data;
        
        // Add to appropriate list based on type
        if (formData.recurringType === 'recurring') {
          setRecurringVisitors(prev => [newVisitor, ...prev]);
        } else {
          setVisitors(prev => [newVisitor, ...prev]);
        }

        setSuccessMessage(`Visitor ${formData.recurringType === 'recurring' ? 'recurring pass' : ''} added successfully!`);
        
        // Reset form and close modal after short delay
        setTimeout(() => {
          setShowAddModal(false);
          resetForm();
        }, 1500);

        console.log('Visitor added successfully:', response.data);
      }
    } catch (error) {
      console.error('Error adding visitor:', error);
      
      // Handle different types of errors similar to LoginForm
      let errorMessage = 'Failed to add visitor. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors object from backend
        const backendErrors = error.response.data.errors;
        if (typeof backendErrors === 'object') {
          const formattedErrors = {};
          for (const [field, messages] of Object.entries(backendErrors)) {
            formattedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
          }
          setErrors(formattedErrors);
          return;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error types
      if (errorMessage.toLowerCase().includes('phone') || errorMessage.toLowerCase().includes('mobile')) {
        setErrors({ phone: errorMessage });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setErrors({ phone: 'Visitor with this phone number already exists' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Update visitor status (check-in/check-out)
  const updateVisitorStatus = async (visitorId, newStatus) => {
    try {
      const response = await api.visitors.updateStatus(visitorId, { status: newStatus });
      if (response.data) {
        // Update local state
        setVisitors(prev => prev.map(visitor => 
          visitor.id === visitorId 
            ? { 
                ...visitor, 
                status: newStatus,
                checkOutTime: newStatus === 'out' ? new Date().toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }).replace(/\//g, '-') : visitor.checkOutTime
              }
            : visitor
        ));
      }
    } catch (error) {
      console.error('Error updating visitor status:', error);
      setErrors({ general: 'Failed to update visitor status' });
    }
  };

  const getStatusColor = (status) => {
    return status === 'in' ? 'text-green-800 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusDot = (status) => {
    return status === 'in' ? 'bg-green-500' : 'bg-red-500';
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'schedule': return 'Schedule';
      case 'walkin': return 'Walk-in';
      case 'visitor': return 'QR Visitor';
      default: return 'Schedule';
    }
  };

  // Calculate stats
  const totalVisitors = visitors.length;
  const checkInCount = visitors.filter(v => v.status === 'in').length;
  const checkOutCount = visitors.filter(v => v.status === 'out').length;
  const walkinCount = visitors.filter(v => v.type === 'walkin').length;
  const scheduleCount = visitors.filter(v => v.type === 'schedule').length;
  const qrVisitorCount = visitors.filter(v => v.type === 'visitor').length;

  // Export to Excel functionality
  const exportToExcel = () => {
    const dataToExport = showRecurring ? recurringVisitors : visitors;
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Type', 'Check-in Time', 'Purpose', 'Host', 'Department', 'Company'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(visitor => [
        `"${visitor.name || ''}"`,
        `"${visitor.phone || ''}"`, 
        `"${visitor.email || ''}"`,
        `"${visitor.status || 'Active'}"`,
        `"${getTypeLabel(visitor.type)}"`,
        `"${visitor.checkInTime || visitor.createdAt || ''}"`,
        `"${visitor.purpose || ''}"`,
        `"${visitor.hostName || ''}"`,
        `"${visitor.department || ''}"`,
        `"${visitor.company || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${showRecurring ? 'recurring_' : ''}visitors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExcelDropdown(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.visitors.uploadExcel(formData);
        if (response.data) {
          // Refresh visitors list
          fetchVisitors();
          setSuccessMessage('Visitors uploaded successfully!');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setErrors({ general: 'Failed to upload file. Please check the format and try again.' });
      }
      setShowExcelDropdown(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 text-purple-800 animate-spin" />
          <span className="text-gray-600">Loading visitors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen m-0 bg-gray-50">
      {/* Error/Success Messages */}
      {errors.general && (
        <div className="p-4 mx-6 mt-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 mx-6 mt-4 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="flex items-center text-xl font-semibold text-gray-900">
                <Users className="w-6 h-6 m-2 text-purple-800" />
                {showRecurring ? 'Recurring Visitors' : 'Regular Visitors'}
              </h1>
              <button 
                onClick={() => setShowRecurring(!showRecurring)}
                className={`p-2 text-sm rounded-lg transition-colors ${
                  showRecurring 
                    ? 'text-purple-800 bg-white hover:bg-purple-100 border border-purple-800' 
                    : 'text-purple-800 bg-white hover:bg-purple-100 border border-purple-800'
                }`}
              >
                {showRecurring ? 'Show Regular Visitors' : 'Recurring Pass'}
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center p-2 text-xs text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100"
              >
                <Plus className="w-4 h-4 text-purple-800" />
                Add Visitor
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 m-2" />
                  Filter
                  <ChevronDown className="w-4 h-4 m-2" />
                </button>
                
                {showFilterDropdown && (
                  <div className="absolute right-0 z-10 w-48 mt-2 bg-white border border-gray-200 rounded-sm shadow-lg">
                    <div className="p-2">
                      {!showRecurring && (
                        <div className="mb-2">
                          <label className="block mb-1 text-xs font-medium text-gray-700">Status</label>
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                          >
                            <option value="all">All ({totalVisitors})</option>
                            <option value="in">Check-In ({checkInCount})</option>
                            <option value="out">Check-Out ({checkOutCount})</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <label className="block mb-1 text-xs font-medium text-gray-700">Type</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded"
                        >
                          <option value="all">All Types</option>
                          <option value="walkin">Walk-in ({walkinCount})</option>
                          <option value="schedule">Schedule ({scheduleCount})</option>
                          <option value="visitor">QR Visitor ({qrVisitorCount})</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Excel Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowExcelDropdown(!showExcelDropdown)}
                  className="flex items-center text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4 m-2"/>
                  Excel
                  <ChevronDown className="w-4 h-4 m-2"/>
                </button>
                
                {showExcelDropdown && (
                  <div className="absolute right-0 z-10 w-40 mt-2 bg-white border border-gray-200 rounded-sm shadow-lg">
                    <div className="py-1">
                      <label className="flex items-center px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Excel
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={exportToExcel}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Excel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicators */}
              {!showRecurring && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">In</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder={`Search ${showRecurring ? 'recurring ' : ''}visitors...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 p-2 pl-8 text-sm border border-gray-300 rounded-lg w-100 focus:ring-2 focus:ring-purple-800 focus:border-transparent"
          />
        </div>
      </div>

      {/* Visitors List */}
      <div className="px-6 py-4">
        {filteredVisitors.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-sm">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {showRecurring ? 'No recurring visitors found' : 'No visitors found'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : showRecurring 
                ? 'No recurring visitors have been registered yet.'
                : 'No visitors have been registered yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="flex items-center justify-between p-4 transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    {!showRecurring && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(visitor.status)} rounded-full border-2 border-white`}></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">{visitor.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {visitor.phone}
                      </span>
                      <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                        {showRecurring ? 'Recurring' : getTypeLabel(visitor.type)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Building2 className="w-3 h-3 mr-1" />
                        {visitor.purpose} {visitor.hostName && `- ${visitor.hostName}`} {visitor.department && `(${visitor.department})`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {visitor.checkInTime || visitor.createdAt}
                    </div>
                    {visitor.status === 'out' && visitor.checkOutTime && (
                      <div className="flex items-center mt-1 text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Out: {visitor.checkOutTime}
                      </div>
                    )}
                  </div>

                  {!showRecurring && (
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(visitor.status)}`}>
                        {visitor.status === 'in' ? 'In' : 'Out'}
                      </span>
                      
                      <button
                        onClick={() => updateVisitorStatus(visitor.id, visitor.status === 'in' ? 'out' : 'in')}
                        className="px-3 py-1 text-xs text-purple-800 transition-colors bg-purple-100 rounded hover:bg-purple-200"
                      >
                        {visitor.status === 'in' ? 'Check Out' : 'Check In'}
                      </button>
                    </div>
                  )}

                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAddModal(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-purple-800">Add Visitor</h2>
                <p className="text-sm text-gray-500">Fill in visitor details</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 text-purple-800 rounded-full hover:text-purple-600 hover:bg-purple-100"
                disabled={submitLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message in Modal */}
            {successMessage && (
              <div className="p-3 mx-6 mt-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span className="text-sm text-green-700">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-3 mb-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                    <span className="text-sm text-red-700">{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Visitor Type Selection */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Visitor Type <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recurringType: 'onetime' }))}
                    className={`flex-1 p-3 text-sm border rounded-lg transition-colors ${
                      formData.recurringType === 'onetime'
                        ? 'bg-purple-50 border-purple-800 text-purple-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">One-time Visit</div>
                    <div className="text-xs text-gray-500">Single day visitor</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recurringType: 'recurring' }))}
                    className={`flex-1 p-3 text-sm border rounded-lg transition-colors ${
                      formData.recurringType === 'recurring'
                        ? 'bg-purple-50 border-purple-800 text-purple-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Recurring Pass</div>
                    <div className="text-xs text-gray-500">Multiple visits</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h3 className="pb-2 mb-3 text-sm font-medium text-gray-900 border-b">Personal Information</h3>
                </div>

                {/* Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter visitor's full name"
                    disabled={submitLoading}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    disabled={submitLoading}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address (optional)"
                    disabled={submitLoading}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    disabled={submitLoading}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Visit Information */}
                <div className="mt-4 md:col-span-2">
                  <h3 className="pb-2 mb-3 text-sm font-medium text-gray-900 border-b">Visit Information</h3>
                </div>

                {/* Purpose */}
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Purpose of Visit <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    rows={2}
                    className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent ${
                      errors.purpose ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter purpose of visit"
                    disabled={submitLoading}
                  />
                  {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
                </div>

                {/* Host Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Host Name</label>
                  <input
                    type="text"
                    name="hostName"
                    value={formData.hostName}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    placeholder="Enter host name"
                    disabled={submitLoading}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    placeholder="Enter department"
                    disabled={submitLoading}
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    placeholder="Enter company name"
                    disabled={submitLoading}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    placeholder="Enter address"
                    disabled={submitLoading}
                  />
                </div>

                {/* Visit Details */}
                <div className="mt-4 md:col-span-2">
                  <h3 className="pb-2 mb-3 text-sm font-medium text-gray-900 border-b">Visit Details</h3>
                </div>

                {/* Visiting Date */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Visiting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="visitingDate"
                    value={formData.visitingDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent ${
                      errors.visitingDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={submitLoading}
                  />
                  {errors.visitingDate && <p className="mt-1 text-xs text-red-600">{errors.visitingDate}</p>}
                </div>

                {/* Visiting Time */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Visiting Time</label>
                  <input
                    type="time"
                    name="visitingTime"
                    value={formData.visitingTime}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    disabled={submitLoading}
                  />
                </div>

                {/* Allowing Hours */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Duration (Hours)</label>
                  <select
                    name="allowingHours"
                    value={formData.allowingHours}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    disabled={submitLoading}
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">Full Day</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    disabled={submitLoading}
                  >
                    <option value="NA">NA</option>
                    <option value="VIP">VIP</option>
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Additional Information */}
                <div className="mt-4 md:col-span-2">
                  <h3 className="pb-2 mb-3 text-sm font-medium text-gray-900 border-b">Additional Information</h3>
                </div>

                {/* Belongings */}
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Belongings</label>
                  <textarea
                    name="belongings"
                    value={formData.belongings}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    placeholder="List any belongings (laptop, bags, etc.)"
                    disabled={submitLoading}
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    disabled={submitLoading}
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Auto">Auto</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Bus">Bus</option>
                    <option value="Walking">Walking</option>
                  </select>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-800 focus:border-transparent"
                    placeholder="Enter vehicle number"
                    disabled={submitLoading}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end pt-4 mt-6 space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center px-4 py-2 text-sm text-white transition-colors bg-purple-800 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {submitLoading 
                    ? `Adding ${formData.recurringType === 'recurring' ? 'Recurring' : ''} Visitor...` 
                    : `Add ${formData.recurringType === 'recurring' ? 'Recurring' : ''} Visitor`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {showFilterDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
      
      {showExcelDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowExcelDropdown(false)}
        />
      )}
    </div>
  );
};

export default GateCheck;