import { useState, useCallback } from 'react';

const useGateCheckState = () => {
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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

  return {
    visitors,
    setVisitors,
    vendors,
    setVendors,
    recurringVisitors,
    setRecurringVisitors,
    categories,
    setCategories,
    filteredVisitors,
    setFilteredVisitors,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory,
    loading,
    setLoading,
    submitLoading,
    setSubmitLoading,
    categoriesLoading,
    setCategoriesLoading,
    showFilterDropdown,
    setShowFilterDropdown,
    showExcelDropdown,
    setShowExcelDropdown,
    showAddModal,
    setShowAddModal,
    showRecurring,
    setShowRecurring,
    errors,
    setErrors,
    successMessage,
    setSuccessMessage,
    refreshTrigger,
    setRefreshTrigger,
    totalVisitors,
    setTotalVisitors,
    totalVendors,
    setTotalVendors,
    approvedCount,
    setApprovedCount,
    pendingCount,
    setPendingCount,
    rejectedCount,
    setRejectedCount,
    oneTimeCount,
    setOneTimeCount,
    recurringCount,
    setRecurringCount,
    permanentCount,
    setPermanentCount,
    formData,
    setFormData,
    handleInputChange,
    resetForm
  };
};

export default useGateCheckState;
