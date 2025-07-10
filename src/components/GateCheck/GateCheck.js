import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../Auth/api';
import VisitorTable from './VisitorTable';
import VisitorForm from './VisitorForm';
import Header from './Header';
import SearchBar from './SearchBar';
import {Search, Filter, FileText, Plus, MoreVertical, Phone, Clock, User, Users, Upload, Download, ChevronDown, X, Calendar, MapPin, Car, Mail, Building2, Loader2, AlertCircle, CheckCircle, Tag } from 'lucide-react';

const GateCheck = ({ onVisitorCountChange, onVendorCountChange, userCompany, user }) => {
  // All the state declarations
  const [visitors, setVisitors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [recurringVisitors, setRecurringVisitors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExcelDropdown, setShowExcelDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    visitor_name: '',
    mobile_number: '',
    email_id: '',
    gender: '',
    pass_type: 'ONE_TIME',
    visiting_date: '',
    visiting_time: '',
    recurring_days: '',
    allowing_hours: '8',
    category: '',
    whom_to_meet: '',
    coming_from: '',
    purpose_of_visit: '',
    belongings_tools: '',
    security_notes: '',
    vehicle_type: '',
    vehicle_number: '',
    valid_until: ''
  });

  // Fixed fetchCategories function
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      console.log('Fetching categories...');
      const response = await api.visitors.category();
      console.log('Categories response:', response);
      
      if (response && response.data) {
        // Handle different response structures
        const categoriesData = response.data.categories || response.data;
        console.log('Categories data:', categoriesData);
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          console.error('Categories data is not an array:', categoriesData);
          setCategories([]);
        }
      } else {
        console.error('No data in categories response');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Set default categories if API fails
      setCategories([
        { id: 1, name: 'Business', value: 'BUSINESS' },
        { id: 2, name: 'Personal', value: 'PERSONAL' },
        { id: 3, name: 'Official', value: 'OFFICIAL' },
        { id: 4, name: 'Delivery', value: 'DELIVERY' },
        { id: 5, name: 'Maintenance', value: 'MAINTENANCE' },
        { id: 6, name: 'Interview', value: 'INTERVIEW' },
        { id: 7, name: 'Meeting', value: 'MEETING' },
        { id: 8, name: 'Training', value: 'TRAINING' },
        { id: 9, name: 'Event', value: 'EVENT' },
        { id: 10, name: 'Other', value: 'OTHER' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fixed fetchVisitors function
  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching visitors...');
      
      // Fetch regular visitors
      const visitorsResponse = await api.visitors.getAll();
      console.log('Visitors response:', visitorsResponse);
      
      if (visitorsResponse && visitorsResponse.data) {
        const visitorsData = visitorsResponse.data.visitors || visitorsResponse.data;
        console.log('Visitors data from backend:', visitorsData);
        
        if (Array.isArray(visitorsData)) {
          setVisitors(visitorsData);
          console.log('Set visitors:', visitorsData.length, 'items');
          
          // Log first visitor to see structure
          if (visitorsData.length > 0) {
            console.log('First visitor structure:', visitorsData[0]);
            console.log('Available fields:', Object.keys(visitorsData[0]));
          }
        } else {
          console.error('Visitors data is not an array:', visitorsData);
          setVisitors([]);
        }
      } else {
        console.error('No data in visitors response');
        setVisitors([]);
      }

      // Fetch recurring visitors
      try {
        console.log('Fetching recurring visitors...');
        const recurringResponse = await api.visitors.getRecurring();
        console.log('Recurring response:', recurringResponse);
        
        if (recurringResponse && recurringResponse.data) {
          const recurringData = recurringResponse.data.visitors || recurringResponse.data;
          console.log('Recurring visitors data from backend:', recurringData);
          
          if (Array.isArray(recurringData)) {
            setRecurringVisitors(recurringData);
            console.log('Set recurring visitors:', recurringData.length, 'items');
            
            if (recurringData.length > 0) {
              console.log('First recurring visitor structure:', recurringData[0]);
            }
          } else {
            console.error('Recurring data is not an array:', recurringData);
            setRecurringVisitors([]);
          }
        } else {
          console.error('No data in recurring response');
          setRecurringVisitors([]);
        }
      } catch (recurringError) {
        console.error('Error fetching recurring visitors:', recurringError);
        console.error('Recurring error details:', recurringError.response?.data || recurringError.message);
        setRecurringVisitors([]);
      }

    } catch (error) {
      console.error('Error fetching visitors:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrors({ general: 'Failed to load visitors data. Please try again.' });
      setVisitors([]);
      setRecurringVisitors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch data on component mount
  useEffect(() => {
    console.log('Component mounted, fetching data...');
    fetchCategories();
    fetchVisitors();
  }, [fetchCategories, fetchVisitors]);

  // Effect to filter visitors based on search and filters
  useEffect(() => {
    console.log('Filtering visitors...');
    console.log('Current visitors:', visitors.length);
    console.log('Current recurring visitors:', recurringVisitors.length);
    console.log('Show recurring:', showRecurring);
    
    const currentVisitors = showRecurring ? recurringVisitors : visitors;
    console.log('Current visitors to filter:', currentVisitors.length);
    
    let filtered = currentVisitors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(visitor =>
        visitor.pass_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.mobile_number?.includes(searchTerm) ||
        visitor.email_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.whom_to_meet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.purpose_of_visit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === filterStatus);
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(visitor => visitor.pass_type === filterType);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(visitor => visitor.category === filterCategory);
    }

    console.log('Filtered visitors:', filtered.length);
    setFilteredVisitors(filtered);
  }, [visitors, recurringVisitors, searchTerm, filterStatus, filterType, filterCategory, showRecurring]);

  // Effect to update parent component counts
  useEffect(() => {
    if (onVisitorCountChange) {
      onVisitorCountChange(visitors.length);
    }
  }, [visitors, onVisitorCountChange]);

  // Validation functions
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
    if (!email.trim()) {
      return { isValid: false, error: 'Please enter email address' };
    }
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

  const validateDateRange = (visitingDate, validUntil) => {
    if (!visitingDate || !validUntil) {
      return { isValid: true, error: null };
    }

    const visiting = new Date(visitingDate);
    const until = new Date(validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visiting < today) {
      return { isValid: false, error: 'Visiting date cannot be in the past' };
    }

    if (visiting > until) {
      return { isValid: false, error: 'Visiting date cannot be after valid until date' };
    }

    return { isValid: true, error: null };
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    const nameValidation = validateRequired(formData.visitor_name, 'visitor name');
    if (!nameValidation.isValid) newErrors.visitor_name = nameValidation.error;

    const phoneValidation = validatePhoneNumber(formData.mobile_number);
    if (!phoneValidation.isValid) newErrors.mobile_number = phoneValidation.error;

    const emailValidation = validateEmail(formData.email_id);
    if (!emailValidation.isValid) newErrors.email_id = emailValidation.error;
    
    if (!formData.gender.trim()) {
      newErrors.gender = 'Please select gender';
    }

    if (!formData.pass_type.trim()) {
      newErrors.pass_type = 'Please select pass type';
    }

    if (!formData.visiting_date.trim()) {
      newErrors.visiting_date = 'Please select visiting date';
    }

    if (!formData.visiting_time.trim()) {
      newErrors.visiting_time = 'Please enter visiting time';
    }

    if (!formData.allowing_hours.trim()) {
      newErrors.allowing_hours = 'Please enter allowing hours';
    }

    if (formData.purpose_of_visit.trim() === '') {
      newErrors.purpose_of_visit = 'Please enter purpose of visit';
    }

    // Validate visiting date is not in the past
    if (formData.visiting_date) {
      const selectedDate = new Date(formData.visiting_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.visiting_date = 'Visiting date cannot be in the past';
      }
    }

    // For recurring passes, validate recurring days and valid until
    if (formData.pass_type === 'RECURRING') {
      if (!formData.recurring_days.trim()) {
        newErrors.recurring_days = 'Please enter number of recurring days';
      }
      if (!formData.valid_until.trim()) {
        newErrors.valid_until = 'Please select valid until date';
      }
    }

    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = 'Please select a category';
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
      visitor_name: '',
      mobile_number: '',
      email_id: '',
      gender: '',
      pass_type: 'ONE_TIME',
      visiting_date: '',
      visiting_time: '',
      recurring_days: '',
      allowing_hours: '8',
      category: '',
      whom_to_meet: '',
      coming_from: user.company || '',
      purpose_of_visit: '',
      belongings_tools: '',
      security_notes: '',
      vehicle_type: '',
      vehicle_number: '',
      valid_until: ''
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
        visitor_name: formData.visitor_name.trim(),
        mobile_number: formData.mobile_number.trim(),
        email_id: formData.email_id.trim(),
        gender: formData.gender,
        pass_type: formData.pass_type,
        visiting_date: formData.visiting_date,
        visiting_time: formData.visiting_time,
        recurring_days: formData.pass_type === 'RECURRING' ? parseInt(formData.recurring_days) : null,
        allowing_hours: parseInt(formData.allowing_hours),
        category: formData.category.trim(),
        whom_to_meet: formData.whom_to_meet.trim() || '',
        coming_from: formData.coming_from.trim() || '',
        purpose_of_visit: formData.purpose_of_visit.trim(),
        belongings_tools: formData.belongings_tools.trim() || '',
        security_notes: formData.security_notes.trim() || null,
        vehicle_type: formData.vehicle_type || null,
        vehicle_number: formData.vehicle_number.trim() || null,
        valid_until: formData.valid_until || null
      };

      console.log('Submitting visitor data:', visitorPayload);

      // Choose appropriate API endpoint based on pass type
      let response;
      if (formData.pass_type === 'RECURRING') {
        response = await api.visitors.createRecurring(visitorPayload);
      } else {
        response = await api.visitors.create(visitorPayload);
      }

      console.log('Submit response:', response);

      if (response && response.data) {
        const newVisitor = response.data.visitor || response.data;
        console.log('New visitor created:', newVisitor);
        
        // Add to appropriate list based on type
        if (formData.pass_type === 'RECURRING') {
          setRecurringVisitors(prev => [newVisitor, ...prev]);
        } else {
          setVisitors(prev => [newVisitor, ...prev]);
        }

        setSuccessMessage(`Visitor ${formData.pass_type === 'RECURRING' ? 'recurring pass' : ''} added successfully!`);
        
        // Reset form and close modal after short delay
        setTimeout(() => {
          setShowAddModal(false);
          resetForm();
        }, 1500);
      }
    } catch (error) {
      console.error('Error adding visitor:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Handle different types of errors
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
        setErrors({ mobile_number: errorMessage });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email_id: errorMessage });
      } else if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setErrors({ mobile_number: 'Visitor with this phone number already exists' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleVisitorUpdate = (visitorId, newStatus, actionType) => {
  console.log('Updating visitor:', visitorId, 'to status:', newStatus, 'action:', actionType);
  
  // Update visitors state
  setVisitors(prev => prev.map(visitor => 
    visitor.id === visitorId
      ? { 
          ...visitor, 
          status: newStatus,
          // Add timestamps based on action
          ...(actionType === 'checkin' && { entry_time: new Date().toISOString() }),
          ...(actionType === 'checkout' && { exit_time: new Date().toISOString() }),
          ...(actionType === 'approve' && { approved_time: new Date().toISOString() }),
          ...(actionType === 'reject' && { rejected_time: new Date().toISOString() })
        }
      : visitor
  ));
  
  // Update recurring visitors state if needed
  setRecurringVisitors(prev => prev.map(visitor => 
    visitor.id === visitorId
      ? { 
          ...visitor, 
          status: newStatus,
          // Add timestamps based on action
          ...(actionType === 'checkin' && { entry_time: new Date().toISOString() }),
          ...(actionType === 'checkout' && { exit_time: new Date().toISOString() }),
          ...(actionType === 'approve' && { approved_time: new Date().toISOString() }),
          ...(actionType === 'reject' && { rejected_time: new Date().toISOString() })
        }
      : visitor
  ));
};

  // Update visitor status (check-in/check-out)
  const updateVisitorStatus = async (visitorId, newStatus) => {
    try {
      console.log('Updating visitor status:', visitorId, newStatus);
      const response = await api.visitors.update(visitorId, { status: newStatus });
      console.log('Update status response:', response);
      
      if (response && response.data) {
        // Update local state
        setVisitors(prev => prev.map(visitor => 
          visitor.id === visitorId
            ? { 
                ...visitor, 
                status: newStatus,
                exit_time: newStatus === 'EXPIRED' ? new Date().toISOString() : visitor.exit_time,
                is_inside: newStatus === 'APPROVED'
              }
            : visitor
        ));
        
        setRecurringVisitors(prev => prev.map(visitor => 
          visitor.id === visitorId
            ? { 
                ...visitor, 
                status: newStatus,
                exit_time: newStatus === 'EXPIRED' ? new Date().toISOString() : visitor.exit_time,
                is_inside: newStatus === 'APPROVED'
              }
            : visitor
        ));
      }
    } catch (error) {
      console.error('Error updating visitor status:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrors({ general: 'Failed to update visitor status' });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'text-green-800 bg-green-100';
      case 'PENDING': return 'text-yellow-800 bg-yellow-100';
      case 'REJECTED': return 'text-red-800 bg-red-100';
      case 'EXPIRED': return 'text-gray-800 bg-gray-100';
      case 'CANCELLED': return 'text-orange-800 bg-orange-100';
      case 'BLACKLISTED': return 'text-red-800 bg-red-200';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusDot = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'REJECTED': return 'bg-red-500';
      case 'EXPIRED': return 'bg-gray-500';
      case 'CANCELLED': return 'bg-orange-500';
      case 'BLACKLISTED': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getPassTypeLabel = (passType) => {
    switch(passType) {
      case 'ONE_TIME': return 'One Time';
      case 'RECURRING': return 'Recurring';
      case 'PERMANENT': return 'Permanent';
      default: return passType;
    }
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.name : categoryValue;
  };

  const exportToExcel = () => {
    const dataToExport = showRecurring ? recurringVisitors : visitors;
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Pass Type', 'Category', 'Visiting Date', 'Purpose', 'Whom to Meet', 'Coming From', 'Vehicle Type'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(visitor => [
        `"${visitor.visitor_name || ''}"`,
        `"${visitor.mobile_number || ''}"`, 
        `"${visitor.email_id || ''}"`,
        `"${visitor.status || ''}"`,
        `"${getPassTypeLabel(visitor.pass_type)}"`,
        `"${getCategoryLabel(visitor.category)}"`,
        `"${visitor.visiting_date || ''}"`,
        `"${visitor.purpose_of_visit || ''}"`,
        `"${visitor.whom_to_meet || ''}"`,
        `"${visitor.coming_from || ''}"`,
        `"${visitor.vehicle_type || ''}"`
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
        if (response && response.data) {
          // Refresh visitors list
          fetchVisitors();
          setSuccessMessage('Visitors uploaded successfully!');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        console.error('Error details:', error.response?.data || error.message);
        setErrors({ general: 'Failed to upload file. Please check the format and try again.' });
      }
      setShowExcelDropdown(false);
    }
  };

  // Render method
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
        <div className="mx-6 mt-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header Component */}
      <Header
        showRecurring={showRecurring}
        setShowRecurring={setShowRecurring}
        setShowAddModal={setShowAddModal}
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        showExcelDropdown={showExcelDropdown}
        setShowExcelDropdown={setShowExcelDropdown}
        handleFileUpload={handleFileUpload}
        exportToExcel={exportToExcel}
        totalVisitors={visitors.length}
        approvedCount={visitors.filter(v => v.status === 'APPROVED').length}
        pendingCount={visitors.filter(v => v.status === 'PENDING').length}
        rejectedCount={visitors.filter(v => v.status === 'REJECTED').length}
        oneTimeCount={visitors.filter(v => v.pass_type === 'ONE_TIME').length}
        recurringCount={visitors.filter(v => v.pass_type === 'RECURRING').length}
        permanentCount={visitors.filter(v => v.pass_type === 'PERMANENT').length}
      />

      {/* SearchBar Component */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* VisitorTable Component */}
      <VisitorTable
        filteredVisitors={filteredVisitors}
        showRecurring={showRecurring}
        onVisitorUpdate={handleVisitorUpdate} // Changed from updateVisitorStatus
        getStatusColor={getStatusColor}
        getStatusDot={getStatusDot}
        getPassTypeLabel={getPassTypeLabel}
        getCategoryLabel={getCategoryLabel}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterType={filterType}
        filterCategory={filterCategory}
      />

      {/* VisitorForm Component */}
      {showAddModal && (
        <VisitorForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          setShowAddModal={setShowAddModal}
          resetForm={resetForm}
          errors={errors}
          submitLoading={submitLoading}
          categories={categories}
          categoriesLoading={categoriesLoading}
          user={user} // Pass userCompany
        />
      )}
    </div>
  );
};

export default GateCheck;