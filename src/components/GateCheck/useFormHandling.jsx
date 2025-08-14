import { useCallback } from 'react';
import { api } from '../Auth/api';

const useFormHandling = (state, dataFetching) => {
  const {
    formData,
    errors,
    setErrors,
    setSuccessMessage,
    setSubmitLoading,
    setShowAddModal,
    showRecurring,
    setVisitors,
    setRecurringVisitors,
    onVisitorCountChange,
    onVendorsCountChange,
    userCompany,
    user
  } = state;

  const { autoRefresh, triggerRefresh, fetchVisitors, fetchVisitorCounts } = dataFetching;

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

        try {
          await autoRefresh();
          console.log('✅ Auto refresh after submit completed');

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

  const handleVisitorUpdate = async (visitorId, newStatus, actionType, additionalData = {}) => {
    try {
      console.log('🔄 Updating visitor status...', { visitorId, newStatus, actionType, additionalData });
      setErrors(prev => ({ ...prev, general: '' }));

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

      updateVisitorInState(visitorId, newStatus, additionalData);

      const updatePayload = {
        status: newStatus,
        action_type: actionType,
        ...additionalData
      };

      console.log('📤 Sending update payload:', updatePayload);

      const response = await api.visitors.updateStatus(visitorId, updatePayload);

      console.log('✅ Update response:', response);

      setSuccessMessage(`Visitor status updated to ${newStatus.toLowerCase().replace('_', ' ')}`);

      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ Visitor updated, refreshing data...');

      try {
        await autoRefresh();
        console.log('✅ Auto refresh after update completed');
      } catch (refreshError) {
        console.error('❌ Auto refresh failed, trying manual trigger:', refreshError);
        triggerRefresh();
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

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Error updating visitor:', error);

      const revertVisitorInState = (visitorId) => {
        fetchVisitors();
      };

      revertVisitorInState(visitorId);

      let errorMessage = 'Failed to update visitor status. Please try again.';

      if (error.response) {
        console.log('Error response:', error.response);

        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.errors) {
          const errors = error.response.data.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ');
          }
        }

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

      setTimeout(() => {
        console.log('🔄 Forcing refresh after error (action might have succeeded)...');
        triggerRefresh();
      }, 2000);
    }
  };

  const handleReschedule = async (visitorId, newVisitingDate, newVisitingTime, additionalData = {}) => {
    try {
      console.log('🔄 Rescheduling visitor...', { visitorId, newVisitingDate, newVisitingTime, additionalData });
      setErrors(prev => ({ ...prev, general: '' }));

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

      updateVisitorScheduleInState(visitorId, newVisitingDate, newVisitingTime, additionalData);

      const reschedulePayload = {
        visiting_date: newVisitingDate,
        visiting_time: newVisitingTime,
        action_type: 'reschedule',
        ...additionalData
      };

      console.log('📤 Sending reschedule payload:', reschedulePayload);

      let response;
      if (api.visitors.reschedule) {
        response = await api.visitors.reschedule(visitorId, reschedulePayload);
      } else {
        response = await api.visitors.updateStatus(visitorId, reschedulePayload);
      }

      console.log('✅ Reschedule response:', response);

      setSuccessMessage(`Visitor rescheduled successfully to ${newVisitingDate} at ${newVisitingTime}`);

      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ Visitor rescheduled, refreshing data...');

      try {
        await autoRefresh();
        console.log('✅ Auto refresh after reschedule completed');
      } catch (refreshError) {
        console.error('❌ Auto refresh failed, trying manual trigger:', refreshError);
        triggerRefresh();
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

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('❌ Error rescheduling visitor:', error);

      const revertVisitorInState = (visitorId) => {
        fetchVisitors();
      };

      revertVisitorInState(visitorId);

      let errorMessage = 'Failed to reschedule visitor. Please try again.';

      if (error.response) {
        console.log('Error response:', error.response);

        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.errors) {
          const errors = error.response.data.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ');
          }
        }

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

      setTimeout(() => {
        console.log('🔄 Forcing refresh after reschedule error (action might have succeeded)...');
        triggerRefresh();
      }, 2000);
    }
  };

  const handleFilterStatusChange = (newStatus) => {
    setFilterStatus(newStatus);
  };

  const handleFilterTypeChange = (newType) => {
    setFilterType(newType);
  };

  const handleFilterCategoryChange = (newCategory) => {
    setFilterCategory(newCategory);
  };

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterCategory('all');
    setSearchTerm('');
  };

  const handleRecurringToggle = (newShowRecurring) => {
    setShowRecurring(newShowRecurring);
    setFilteredVisitors([]);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh button clicked');
    try {
      await autoRefresh();
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      triggerRefresh();
    }
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

          try {
            await autoRefresh();
            console.log('✅ Auto refresh after upload completed');

            setTimeout(() => {
              triggerRefresh();
            }, 1000);

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

  return {
    handleSubmit,
    handleVisitorUpdate,
    handleReschedule,
    handleFilterStatusChange,
    handleFilterTypeChange,
    handleFilterCategoryChange,
    handleClearFilters,
    handleRecurringToggle,
    handleSearchChange,
    handleManualRefresh,
    exportToExcel,
    handleFileUpload
  };
};

export default useFormHandling;
