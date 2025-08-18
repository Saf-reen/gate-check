import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../Auth/api';
import VisitorTable from './VisitorTable';
import VisitorForm from './VisitorForm';
import Header from './Header';
import SearchBar from './SearchBar';
import {
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react';

const GateCheck = ({ onVisitorCountChange, userCompany, user, onVendorsCountChange, onCategoryCountsChange, }) => {
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

  // Add refresh trigger state for manual refreshes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Counts for filters
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [oneTimeCount, setOneTimeCount] = useState(0);
  const [recurringCount, setRecurringCount] = useState(0);
  const [permanentCount, setPermanentCount] = useState(0);

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

  // Helper function to apply frontend filters to visitor data
  const applyFilters = useCallback((data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    let filtered = [...data];

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(visitor => 
        visitor.visitor_name?.toLowerCase().includes(searchLower) ||
        visitor.mobile_number?.includes(searchTerm) ||
        visitor.email_id?.toLowerCase().includes(searchLower) ||
        visitor.coming_from?.toLowerCase().includes(searchLower) ||
        visitor.purpose_of_visit?.toLowerCase().includes(searchLower) ||
        visitor.pass_id?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === filterStatus);
    }

    // Apply pass type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(visitor => visitor.pass_type === filterType);
    }

    // Apply category filter - use category_name from backend
    if (filterCategory !== 'all') {
      filtered = filtered.filter(visitor => visitor.category_name === filterCategory);
    }

    return filtered;
  }, [searchTerm, filterStatus, filterType, filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.visitors.category();
      if (response && response.data) {
        const categoriesData = response.data.categories || response.data;
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
          // Calculate counts for each category
          const counts = categoriesData.map(category => ({
            name: category.name,
            count: category.visitor_count || 0,
          }));
          // Call the callback to update category counts in App.jsx
          if (onCategoryCountsChange) {
            onCategoryCountsChange(counts);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setErrors(prev => ({ ...prev, categories: 'Failed to load categories' }));
    } finally {
      setCategoriesLoading(false);
    }
  }, [onCategoryCountsChange]);

  // Function to calculate counts from visitors array with filters applied
  const calculateVisitorCounts = useCallback((visitorsData) => {
    if (!Array.isArray(visitorsData)) {
      const resetCounts = {
        totalVisitors: 0,
        totalVendors: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        oneTime: 0,
        recurring: 0,
        permanent: 0
      };
      
      setTotalVisitors(resetCounts.totalVisitors);
      setTotalVendors(resetCounts.totalVendors);
      setApprovedCount(resetCounts.approved);
      setPendingCount(resetCounts.pending);
      setRejectedCount(resetCounts.rejected);
      setOneTimeCount(resetCounts.oneTime);
      setRecurringCount(resetCounts.recurring);
      setPermanentCount(resetCounts.permanent);
      
      // Notify parent components
      if (onVisitorCountChange) {
        onVisitorCountChange(resetCounts.totalVisitors);
      }
      if (onVendorsCountChange) {
        onVendorsCountChange(resetCounts.totalVendors);
      }
      return;
    }

    // Apply current filters to get filtered data
    const filteredData = applyFilters(visitorsData);
    
    // Calculate status counts from filtered data
    const total = filteredData.length;
    const approved = filteredData.filter(visitor => visitor.status === 'APPROVED').length;
    const pending = filteredData.filter(visitor => visitor.status === 'PENDING').length;
    const rejected = filteredData.filter(visitor => visitor.status === 'REJECTED').length;

    // Calculate pass type counts from filtered data (excluding status filter for pass type counts)
    let passTypeFilteredData = [...visitorsData];
    
    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      passTypeFilteredData = passTypeFilteredData.filter(visitor => 
        visitor.visitor_name?.toLowerCase().includes(searchLower) ||
        visitor.mobile_number?.includes(searchTerm) ||
        visitor.email_id?.toLowerCase().includes(searchLower) ||
        visitor.coming_from?.toLowerCase().includes(searchLower) ||
        visitor.purpose_of_visit?.toLowerCase().includes(searchLower) ||
        visitor.pass_id?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter for pass type counts
    if (filterCategory !== 'all') {
      passTypeFilteredData = passTypeFilteredData.filter(visitor => visitor.category_name === filterCategory);
    }

    const oneTime = passTypeFilteredData.filter(visitor => visitor.pass_type === 'ONE_TIME').length;
    const recurring = passTypeFilteredData.filter(visitor => visitor.pass_type === 'RECURRING').length;
    const permanent = passTypeFilteredData.filter(visitor => visitor.pass_type === 'PERMANENT').length;

    setTotalVisitors(total);
    setTotalVendors(total);
    setApprovedCount(approved);
    setPendingCount(pending);
    setRejectedCount(rejected);
    setOneTimeCount(oneTime);
    setRecurringCount(recurring);
    setPermanentCount(permanent);
    
    // Notify parent components of the updated counts
    if (onVisitorCountChange) {
      onVisitorCountChange(total);
    }
    if (onVendorsCountChange) {
      onVendorsCountChange(total);
    }
  }, [searchTerm, filterCategory, applyFilters, onVisitorCountChange, onVendorsCountChange]);

  const fetchVisitorCounts = useCallback(async () => {
    if (!showRecurring) {
      // For non-recurring, counts are calculated from fetched data
      return;
    }

    try {
      const baseParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory !== 'all' && { category: filterCategory })
      };

      const totalResponse = await api.visitors.filterPassType({
        ...baseParams,
        count_only: true
      });
      
      console.log('Total Response:', totalResponse.data);
      const newTotalVisitors = totalResponse?.data?.count || 0;
      const newTotalVendors = totalResponse?.data?.vendors_count || 0;
      
      setTotalVisitors(newTotalVisitors);
      setTotalVendors(newTotalVendors);
      
      // Call the parent callbacks immediately when counts are updated
      if (onVisitorCountChange) {
        onVisitorCountChange(newTotalVisitors);
      }
      if (onVendorsCountChange) {
        onVendorsCountChange(newTotalVendors);
      }

      setApprovedCount(0);
      setPendingCount(0);
      setRejectedCount(0);

      const [oneTimeResponse, recurringResponse, permanentResponse] = await Promise.all([
        api.visitors.filterPassType({ ...baseParams, pass_type: 'ONE_TIME', count_only: true }),
        api.visitors.filterPassType({ ...baseParams, pass_type: 'RECURRING', count_only: true }),
        api.visitors.filterPassType({ ...baseParams, pass_type: 'PERMANENT', count_only: true })
      ]);

      setOneTimeCount(oneTimeResponse?.data?.count || 0);
      setRecurringCount(recurringResponse?.data?.count || 0);
      setPermanentCount(permanentResponse?.data?.count || 0);
    } catch (error) {
      console.error('Error fetching visitor counts:', error);
      setErrors(prev => ({ ...prev, counts: 'Failed to load visitor counts' }));
    }
  }, [searchTerm, filterCategory, showRecurring, onVisitorCountChange, onVendorsCountChange]);

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, general: '' })); // Clear previous errors
      
      // For API calls, we still send the backend expected parameters
      const filterParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { pass_type: filterType }),
        ...(filterCategory !== 'all' && { category: filterCategory })
      };

      if (showRecurring) {
        const recurringResponse = await api.visitors.getRecurring(filterParams);
        if (recurringResponse && recurringResponse.data) {
          const recurringData = recurringResponse.data.visitors || recurringResponse.data;
          if (Array.isArray(recurringData)) {
            setRecurringVisitors(recurringData);
            // Apply frontend filters to the data
            const filtered = applyFilters(recurringData);
            setFilteredVisitors(filtered);
          } else {
            setRecurringVisitors([]);
            setFilteredVisitors([]);
          }
        }
      } else {
        const visitorsResponse = await api.visitors.getAll(filterParams);
        console.log('Visitors Response:', visitorsResponse);
        console.log('inside', visitorsResponse.data?.is_inside);
        if (visitorsResponse && visitorsResponse.data) {
          const visitorsData = visitorsResponse.data.visitors || visitorsResponse.data;
          if (Array.isArray(visitorsData)) {
            setVisitors(visitorsData);
            // Apply frontend filters to the data
            const filtered = applyFilters(visitorsData);
            setFilteredVisitors(filtered);
          } else {
            setVisitors([]);
            setFilteredVisitors([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to load visitors data. Please try again.' }));
      setVisitors([]);
      setRecurringVisitors([]);
      setFilteredVisitors([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterType, filterCategory, showRecurring, applyFilters]);

  // Enhanced auto refresh function with better error handling and logging
  const autoRefresh = useCallback(async () => {
    console.log('🔄 Auto refreshing data...');
    try {
      // Clear any previous errors
      setErrors({});
      
      // Fetch data sequentially to avoid race conditions
      await fetchVisitors();
      
      // Only fetch visitor counts if in recurring mode
      if (showRecurring) {
        await fetchVisitorCounts();
      }
      
      // Categories typically don't change often, so only refresh if needed
      // await fetchCategories();
      
      console.log('✅ Auto refresh completed successfully');
    } catch (error) {
      console.error('❌ Error during auto refresh:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to refresh data. Please try again.' }));
    }
  }, [fetchVisitors, fetchVisitorCounts, showRecurring]);

  // Manual refresh trigger function
  const triggerRefresh = useCallback(() => {
    console.log('🔄 Triggering manual refresh...');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Calculate frontend counts whenever visitors data or filters change
  useEffect(() => {
    if (!showRecurring && visitors.length >= 0) {
      calculateVisitorCounts(visitors);
      // Also update filtered visitors when filters change
      const filtered = applyFilters(visitors);
      setFilteredVisitors(filtered);
    }
  }, [visitors, calculateVisitorCounts, showRecurring, applyFilters]);

  // Update filtered visitors when recurring visitors change
  useEffect(() => {
    if (showRecurring && recurringVisitors.length >= 0) {
      const filtered = applyFilters(recurringVisitors);
      setFilteredVisitors(filtered);
    }
  }, [recurringVisitors, showRecurring, applyFilters]);

  // Effect for manual refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Manual refresh triggered:', refreshTrigger);
      autoRefresh();
    }
  }, [refreshTrigger, autoRefresh]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🚀 Loading initial data...');
      await fetchCategories();
      await fetchVisitors();
      if (showRecurring) {
        await fetchVisitorCounts();
      }
    };
    
    loadInitialData();
  }, [showRecurring]); // Only depend on showRecurring for initial load

  // Handle search with debounce
  useEffect(() => {
    if (searchTerm !== '') {
      const timeoutId = setTimeout(() => {
        fetchVisitors();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (searchTerm === '') {
      // If search is cleared, fetch immediately
      fetchVisitors();
    }
  }, [searchTerm, fetchVisitors]);

  // Handle filter changes
  useEffect(() => {
    if (filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all') {
      const timeoutId = setTimeout(() => {
        fetchVisitors();
        if (showRecurring) {
          fetchVisitorCounts();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [filterStatus, filterType, filterCategory, showRecurring, fetchVisitors, fetchVisitorCounts]);

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

  const validateForm = () => {
    const newErrors = {};

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

    if (formData.visiting_date) {
      const selectedDate = new Date(formData.visiting_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.visiting_date = 'Visiting date cannot be in the past';
      }
    }

    if (formData.pass_type === 'RECURRING') {
      if (!formData.recurring_days.trim()) {
        newErrors.recurring_days = 'Please enter number of recurring days';
      }
      if (!formData.valid_until.trim()) {
        newErrors.valid_until = 'Please select valid until date';
      }
    }

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
      coming_from: '',
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
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
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

      let response;
      if (formData.pass_type === 'RECURRING') {
        response = await api.visitors.create(visitorPayload);
      } else {
        response = await api.visitors.createRecurring(visitorPayload);
      }

      if (response && response.data) {
        console.log('✅ Visitor added successfully, refreshing data...');
        setSuccessMessage(`Visitor ${formData.pass_type === 'RECURRING' ? 'recurring pass' : ''} added successfully!`);
        
        // Enhanced refresh - try both auto refresh and trigger refresh as fallback
        try {
          await autoRefresh();
          console.log('✅ Auto refresh after submit completed');
          
          // Additional trigger refresh as backup
          setTimeout(() => {
            triggerRefresh();
          }, 500);
          
        } catch (refreshError) {
          console.error('❌ Auto refresh failed, using trigger refresh:', refreshError);
          triggerRefresh();
        }
        
        setTimeout(() => {
          setShowAddModal(false);
          resetForm();
        }, 1000);
      }
    } catch (error) {
      let errorMessage = 'Failed to add visitor. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
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

  // FIXED handleVisitorUpdate function with better error handling and state management
  const handleVisitorUpdate = async (visitorId, newStatus, actionType, additionalData = {}) => {
    try {
      console.log('🔄 Updating visitor status...', { visitorId, newStatus, actionType, additionalData });
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, general: '' }));
      
      // Optimistic update - immediately update the UI
      const updateVisitorInState = (visitorId, newStatus, additionalData = {}) => {
        setVisitors(prev => prev.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: newStatus, ...additionalData }
            : visitor
        ));
        
        setRecurringVisitors(prev => prev.map(visitor => 
          visitor.id === visitorId 
            ? { ...visitor, status: newStatus, ...additionalData }
            : visitor
        ));
      };

      // Apply optimistic update for immediate UI feedback
      updateVisitorInState(visitorId, newStatus, additionalData);
      
      // Prepare the payload - adjust based on your backend API expectations
      const updatePayload = {
        status: newStatus,
        action_type: actionType,
        ...additionalData
      };
      
      console.log('📤 Sending update payload:', updatePayload);
      
      // Make the API call and wait for response
      const response = await api.visitors.updateStatus(visitorId, updatePayload);
      
      console.log('✅ Update response:', response);
      
      // Show success message
      setSuccessMessage(`Visitor status updated to ${newStatus.toLowerCase().replace('_', ' ')}`);
      
      // Wait a bit for backend to process (if needed)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enhanced refresh with better error handling
      console.log('✅ Visitor updated, refreshing data...');
      
      try {
        // Try auto refresh first
        await autoRefresh();
        console.log('✅ Auto refresh after update completed');
        
      } catch (refreshError) {
        console.error('❌ Auto refresh failed, trying manual trigger:', refreshError);
        
        // Fallback to trigger refresh
        triggerRefresh();
        
        // If that fails too, try direct fetch
        setTimeout(async () => {
          try {
            await fetchVisitors();
            if (showRecurring) {
              await fetchVisitorCounts();
            }
          } catch (directFetchError) {
            console.error('❌ Direct fetch also failed:', directFetchError);
          }
        }, 1000);
      }
      
      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error updating visitor:', error);
      
      // Revert optimistic update on error
      const revertVisitorInState = (visitorId) => {
        // Re-fetch to get the correct state
        fetchVisitors();
      };
      
      revertVisitorInState(visitorId);
      
      // Enhanced error handling
      let errorMessage = 'Failed to update visitor status. Please try again.';
      
      if (error.response) {
        console.log('Error response:', error.response);
        
        // Check for specific error messages from backend
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ');
          }
        }
        
        // Check status codes
        if (error.response.status === 404) {
          errorMessage = 'Visitor not found. Please refresh and try again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.response.status === 422) {
          errorMessage = 'Invalid data provided. Please check and try again.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
      
      // Force refresh in case the action actually succeeded but response failed
      setTimeout(() => {
        console.log('🔄 Forcing refresh after error (action might have succeeded)...');
        triggerRefresh();
      }, 2000);
    }
  };

  // FIXED handleReschedule function with same enhanced error handling
  const handleReschedule = async (visitorId, newVisitingDate, newVisitingTime, additionalData = {}) => {
    try {
      console.log('🔄 Rescheduling visitor...', { visitorId, newVisitingDate, newVisitingTime, additionalData });
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, general: '' }));
      
      // Optimistic update - immediately update the UI with new schedule
      const updateVisitorScheduleInState = (visitorId, newVisitingDate, newVisitingTime, additionalData = {}) => {
        setVisitors(prev => prev.map(visitor => 
          visitor.id === visitorId 
            ? { 
                ...visitor, 
                visiting_date: newVisitingDate,
                visiting_time: newVisitingTime,
                ...additionalData
              }
            : visitor
        ));
        
        setRecurringVisitors(prev => prev.map(visitor => 
          visitor.id === visitorId 
            ? { 
                ...visitor, 
                visiting_date: newVisitingDate,
                visiting_time: newVisitingTime,
                ...additionalData
              }
            : visitor
        ));
      };

      // Apply optimistic update for immediate UI feedback
      updateVisitorScheduleInState(visitorId, newVisitingDate, newVisitingTime, additionalData);
      
      // Prepare the payload for reschedule
      const reschedulePayload = {
        visiting_date: newVisitingDate,
        visiting_time: newVisitingTime,
        action_type: 'reschedule',
        ...additionalData
      };
      
      console.log('📤 Sending reschedule payload:', reschedulePayload);
      
      // Make the API call - use reschedule endpoint if available, otherwise use updateStatus
      let response;
      if (api.visitors.reschedule) {
        response = await api.visitors.reschedule(visitorId, reschedulePayload);
      } else {
        // Fallback to updateStatus if no specific reschedule endpoint
        response = await api.visitors.updateStatus(visitorId, reschedulePayload);
      }
      
      console.log('✅ Reschedule response:', response);
      
      // Show success message
      setSuccessMessage(`Visitor rescheduled successfully to ${newVisitingDate} at ${newVisitingTime}`);
      
      // Wait a bit for backend to process (if needed)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enhanced refresh with better error handling
      console.log('✅ Visitor rescheduled, refreshing data...');
      
      try {
        // Try auto refresh first
        await autoRefresh();
        console.log('✅ Auto refresh after reschedule completed');
        
      } catch (refreshError) {
        console.error('❌ Auto refresh failed, trying manual trigger:', refreshError);
        
        // Fallback to trigger refresh
        triggerRefresh();
        
        // If that fails too, try direct fetch
        setTimeout(async () => {
          try {
            await fetchVisitors();
            if (showRecurring) {
              await fetchVisitorCounts();
            }
          } catch (directFetchError) {
            console.error('❌ Direct fetch also failed:', directFetchError);
          }
        }, 1000);
      }
      
      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error rescheduling visitor:', error);
      
      // Revert optimistic update on error
      const revertVisitorInState = (visitorId) => {
        // Re-fetch to get the correct state
        fetchVisitors();
      };
      
      revertVisitorInState(visitorId);
      
      // Enhanced error handling
      let errorMessage = 'Failed to reschedule visitor. Please try again.';
      
      if (error.response) {
        console.log('Error response:', error.response);
        
        // Check for specific error messages from backend
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.errors) {
          // Handle validation errors
          const errors = error.response.data.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ');
          }
        }
        
        // Check status codes
        if (error.response.status === 404) {
          errorMessage = 'Visitor not found. Please refresh and try again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to reschedule this visitor.';
        } else if (error.response.status === 422) {
          errorMessage = 'Invalid date or time provided. Please check and try again.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid reschedule data. Please check the date and time format.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
      
      // Force refresh in case the action actually succeeded but response failed
      setTimeout(() => {
        console.log('🔄 Forcing refresh after reschedule error (action might have succeeded)...');
        triggerRefresh();
      }, 2000);
    }
  };

  const handleFilterStatusChange = (newStatus) => {
    setFilterStatus(newStatus);
    // fetchVisitors will be called by useEffect
  };

  const handleFilterTypeChange = (newType) => {
    setFilterType(newType);
    // fetchVisitors will be called by useEffect
  };

  const handleFilterCategoryChange = (newCategory) => {
    setFilterCategory(newCategory);
    // fetchVisitors will be called by useEffect
  };

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterCategory('all');
    setSearchTerm('');
    // fetchVisitors will be called by useEffect when these values change
  };

  const handleRecurringToggle = (newShowRecurring) => {
    setShowRecurring(newShowRecurring);
    setFilteredVisitors([]);
    // Initial data load useEffect will handle the refresh
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'text-green-800 bg-green-100';
      case 'PENDING': return 'text-yellow-800 bg-yellow-100';
      case 'REJECTED': return 'text-red-800 bg-red-100';
      case 'EXPIRED': return 'text-gray-800 bg-gray-100';
      case 'CANCELLED': return 'text-orange-800 bg-orange-100';
      case 'BLACKLISTED': return 'text-red-800 bg-red-200';
      case 'CHECKED_IN': return 'text-blue-800 bg-blue-100';
      case 'CHECKED_OUT': return 'text-purple-800 bg-purple-100';
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
      case 'CHECKED_IN': return 'bg-blue-500';
      case 'CHECKED_OUT': return 'bg-purple-500';
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
    // First try to find by value field (for form data)
    const categoryByValue = categories.find(cat => cat.value === categoryValue);
    if (categoryByValue) {
      return categoryByValue.name;
    }
    
    // Then try to find by name field (for backend data that sends category_name)
    const categoryByName = categories.find(cat => cat.name === categoryValue);
    if (categoryByName) {
      return categoryByName.name;
    }
    
    // Return the original value if not found
    return categoryValue;
  };

  const exportToExcel = async () => {
    try {
      setShowExcelDropdown(false);
      
      const filterParams = {
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { pass_type: filterType }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
        export: 'xls'
      };

      const response = showRecurring
        ? await api.visitors.exportRecurring(filterParams)
        : await api.visitors.export(filterParams);

      if (response && response.data) {
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${showRecurring ? 'recurring_' : ''}visitors_${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Enhanced refresh after export
        console.log('✅ Export completed, refreshing data...');
        try {
          await autoRefresh();
        } catch (refreshError) {
          console.error('❌ Auto refresh after export failed:', refreshError);
          triggerRefresh();
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to export data. Please try again.' }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setShowExcelDropdown(false);
        
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('📁 Uploading file...');
        const response = await api.visitors.uploadExcel(formData);
        
        if (response && response.data) {
          setSuccessMessage('Visitors uploaded successfully!');
          
          console.log('✅ File uploaded successfully, refreshing data...');
          
          // Enhanced refresh after file upload with multiple fallbacks
          try {
            await autoRefresh();
            console.log('✅ Auto refresh after upload completed');
            
            // Additional trigger refresh as backup
            setTimeout(() => {
              triggerRefresh();
            }, 1000); // Longer delay for file processing
            
          } catch (refreshError) {
            console.error('❌ Auto refresh after upload failed:', refreshError);
            triggerRefresh();
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setErrors(prev => ({ ...prev, general: 'Failed to upload file. Please check the format and try again.' }));
      }
    }
  };

  // Enhanced search handler
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    // fetchVisitors will be called by useEffect with debounce
  };

  // Add a manual refresh button handler for debugging/testing
  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh button clicked');
    try {
      await autoRefresh();
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      triggerRefresh();
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
      {errors.general && (
        <div className="mx-6 mt-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              <span className="text-red-700">{errors.general}</span>
            </div>
            {/* Add manual refresh button for debugging */}
            <button
              onClick={handleManualRefresh}
              className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              Retry
            </button>
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

      <Header
        showRecurring={showRecurring}
        setShowRecurring={handleRecurringToggle}
        setShowAddModal={setShowAddModal}
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterStatus={filterStatus}
        setFilterStatus={handleFilterStatusChange}
        filterType={filterType}
        setFilterType={handleFilterTypeChange}
        filterCategory={filterCategory}
        setFilterCategory={handleFilterCategoryChange}
        categories={categories}
        showExcelDropdown={showExcelDropdown}
        setShowExcelDropdown={setShowExcelDropdown}
        handleFileUpload={handleFileUpload}
        exportToExcel={exportToExcel}
        totalVisitors={totalVisitors}
        approvedCount={approvedCount}
        pendingCount={pendingCount}
        rejectedCount={rejectedCount}
        oneTimeCount={oneTimeCount}
        recurringCount={recurringCount}
        permanentCount={permanentCount}
        onClearFilters={handleClearFilters}
      />

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
      />

      <VisitorTable
        filteredVisitors={filteredVisitors}
        showRecurring={showRecurring}
        onVisitorUpdate={handleVisitorUpdate}
        onVisitorReschedule={handleReschedule}
        getStatusColor={getStatusColor}
        getStatusDot={getStatusDot}
        getPassTypeLabel={getPassTypeLabel}
        getCategoryLabel={getCategoryLabel}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterType={filterType}
        filterCategory={filterCategory}
      />

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
          successMessage={successMessage}
          userCompany={userCompany}
          user={user}
        />
      )}
    </div>
  );
};

export default GateCheck;