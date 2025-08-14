import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../Auth/api';
import {
  Users, MoreVertical, Phone, Clock, User, Calendar, MapPin, Car, Mail,
  Building2, Loader2, X, Tag, FileText, RefreshCw
} from 'lucide-react';

const VisitorTable = ({
  filteredVisitors,
  showRecurring,
  onVisitorUpdate,
  getStatusColor,
  getStatusDot,
  getPassTypeLabel,
  getCategoryLabel
}) => {
  const [loadingActions, setLoadingActions] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    visitor: null,
    newDate: '',
    newTime: '',
    errors: {}
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fixed useEffect for click outside detection
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setOpenDropdown(null);
  //     }
  //   };

  //   if (openDropdown !== null) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [openDropdown]);

  // Memoized function to check if visiting time is in the past
  const isVisitingTimeInPast = useCallback((visitingDate, visitingTime) => {
    if (!visitingDate) return false;
    
    const now = new Date();
    const visitDate = new Date(visitingDate);
    
    if (visitingTime) {
      const [hours, minutes] = visitingTime.split(':');
      visitDate.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
      // If no time specified, consider end of day
      visitDate.setHours(23, 59, 59);
    }
    
    return visitDate < now;
  }, []);

  const handleStatusUpdate = async (visitorId, newStatus, actionType) => {
    setLoadingActions(prev => ({ ...prev, [`${visitorId}-${actionType}`]: true }));
    
    try {
      let response;
      switch (actionType) {
        case 'approve':
          response = await api.visitors.approve(visitorId);
          break;
        case 'reject':
          response = await api.visitors.reject(visitorId);
          break;
        case 'checkin':
          response = await api.visitors.checkin(visitorId);
          console.log('Checkin response:', response);
          break;
        case 'checkout':
          response = await api.visitors.checkout(visitorId);
          console.log('Checkout response:', response);
          break;
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }

      // Check if response is successful (status 200-299)
      if (response && (response.status === 200)) {
        let actualStatus = newStatus;

        // For checkin action, if successful, set status to CHECKED_IN
        if (actionType === 'checkin') {
          actualStatus = 'CHECKED_IN';
          console.log(`Setting visitor ${visitorId} status to CHECKED_IN`);
        }
        
        // For checkout action, if successful, set status to CHECKED_OUT
        if (actionType === 'checkout') {
          actualStatus = 'CHECKED_OUT';
          console.log(`Setting visitor ${visitorId} status to CHECKED_OUT`);
        }

        console.log('Calling onVisitorUpdate with:', { visitorId, actualStatus, actionType });
        
        if (onVisitorUpdate) {
          onVisitorUpdate(visitorId, actualStatus, actionType);
        } else {
          console.warn('onVisitorUpdate callback is not provided!');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error(`Failed to ${actionType} visitor:`, error);
      alert(`Failed to ${actionType} visitor. Please try again.`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`${visitorId}-${actionType}`]: false }));
    }
  };

  const handlePassGeneration = async (visitorId, passType) => {
    setLoadingActions(prev => ({ ...prev, [`${visitorId}-${passType}`]: true }));
    setOpenDropdown(null);
    console.log("manual clicked");
    
    try {
      const visitorData = filteredVisitors.find(visitor => visitor.id === visitorId);
      if (passType === 'manual') {
        navigate('/manual-pass', { state: { visitor: visitorData } });
      } else if (passType === 'qr') {
        navigate('/qr-pass', { state: { visitor: visitorData } });
      }
    } catch (error) {
      alert(`Failed to generate ${passType === 'manual' ? 'manual' : 'qr'} pass. Please try again.`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`${visitorId}-${passType}`]: false }));
    }
  };

  const handleReschedule = (visitor) => {
    setRescheduleModal({
      isOpen: true,
      visitor: visitor,
      newDate: '',
      newTime: '',
      errors: {}
    });
    setOpenDropdown(null);
  };

  const validateRescheduleForm = useCallback(() => {
    const errors = {};
    const now = new Date();
    
    if (!rescheduleModal.newDate) {
      errors.newDate = 'Date is required';
    } else {
      const selectedDate = new Date(rescheduleModal.newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        errors.newDate = 'Date must be in the future';
      }
    }
    
    if (!rescheduleModal.newTime) {
      errors.newTime = 'Time is required';
    } else if (rescheduleModal.newDate) {
      // Check if the complete datetime is in the future
      const selectedDateTime = new Date(`${rescheduleModal.newDate}T${rescheduleModal.newTime}`);
      if (selectedDateTime <= now) {
        errors.newTime = 'Date and time must be in the future';
      }
    }
    
    return errors;
  }, [rescheduleModal.newDate, rescheduleModal.newTime]);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateRescheduleForm();
    if (Object.keys(errors).length > 0) {
      setRescheduleModal(prev => ({ ...prev, errors }));
      return;
    }

    const visitorId = rescheduleModal.visitor.id;
    setLoadingActions(prev => ({ ...prev, [`${visitorId}-reschedule`]: true }));

    try {
      // Prepare the payload
      const payload = {
        new_date: rescheduleModal.newDate,
        new_time: rescheduleModal.newTime + ':00' // Add seconds to match HH:MM:SS format
      };

      // Make API call to reschedule
      const response = await api.visitors.reschedule(visitorId, payload, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Adjust based on your auth setup
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the visitor in the local state
        if (onVisitorUpdate) {
          onVisitorUpdate(visitorId, 'PENDING', 'reschedule', {
            visiting_date: data.new_date,
            visiting_time: data.new_time.substring(0, 5) // Remove seconds for display (HH:MM format)
          });
        }

        // Close modal and show success message
        setRescheduleModal({
          isOpen: false,
          visitor: null,
          newDate: '',
          newTime: '',
          errors: {}
        });

        alert('Visitor successfully rescheduled!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reschedule visitor');
      }
    } catch (error) {
      console.error('Failed to reschedule visitor:', error);
      alert(`Failed to reschedule visitor: ${error.message}`);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`${visitorId}-reschedule`]: false }));
    }
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      visitor: null,
      newDate: '',
      newTime: '',
      errors: {}
    });
  };

  // Memoized function to get action buttons
  const getActionButtons = useCallback((visitor) => {
    const buttons = [];
    
    // PENDING status: Show buttons based on visit timing
    if (visitor.status === 'PENDING') {
      // Calculate if visiting date/time is in the past
      const now = new Date();
      let visitDateTime;
      
      if (visitor.visiting_date && visitor.visiting_time) {
        visitDateTime = new Date(`${visitor.visiting_date}T${visitor.visiting_time}`);
      } else if (visitor.visiting_date) {
        // If no time specified, assume end of day
        visitDateTime = new Date(visitor.visiting_date);
        visitDateTime.setHours(23, 59, 59);
      } else {
        // If no date, assume current time (shouldn't happen but fallback)
        visitDateTime = now;
      }
      
      const isInPast = visitDateTime < now;
      
      if (isInPast) {
        // If visit is in the past, ONLY show Reschedule button
        buttons.push(
          <button
            key="reschedule"
            onClick={() => handleReschedule(visitor)}
            disabled={loadingActions[`${visitor.id}-reschedule`]}
            className="px-2 py-1 text-xs text-orange-600 border border-orange-600 rounded hover:text-orange-900 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingActions[`${visitor.id}-reschedule`] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <RefreshCw className="inline w-3 h-3 mr-1" />
                Reschedule
              </>
            )}
          </button>
        );
      } else {
        // If visit is in the future, show Approve and Reject buttons
        buttons.push(
          <button
            key="approve"
            onClick={() => handleStatusUpdate(visitor.id, 'APPROVED', 'approve')}
            disabled={loadingActions[`${visitor.id}-approve`]}
            className="px-2 py-1 text-xs text-green-600 border border-green-600 rounded hover:text-green-900 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingActions[`${visitor.id}-approve`] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Approve'
            )}
          </button>
        );
        buttons.push(
          <button
            key="reject"
            onClick={() => handleStatusUpdate(visitor.id, 'REJECTED', 'reject')}
            disabled={loadingActions[`${visitor.id}-reject`]}
            className="px-2 py-1 text-xs text-red-600 border border-red-600 rounded hover:text-red-900 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingActions[`${visitor.id}-reject`] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Reject'
            )}
          </button>
        );
      }
    }
    
    // APPROVED status: Show Check In button if not inside, Check Out button if inside
    if (visitor.status === 'APPROVED') {
      if (visitor.is_inside) {
        // If approved and inside, show Check Out button
        buttons.push(
          <button
            key="checkout"
            onClick={() => handleStatusUpdate(visitor.id, 'CHECKED_OUT', 'checkout')}
            disabled={loadingActions[`${visitor.id}-checkout`]}
            className="px-2 py-1 text-xs text-gray-600 border border-gray-600 rounded hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingActions[`${visitor.id}-checkout`] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Check Out'
            )}
          </button>
        );
      } else {
        // If approved but not inside, show Check In button
        buttons.push(
          <button
            key="checkin"
            onClick={() => handleStatusUpdate(visitor.id, 'CHECKED_IN', 'checkin')}
            disabled={loadingActions[`${visitor.id}-checkin`]}
            className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:text-blue-900 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingActions[`${visitor.id}-checkin`] ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Check In'
            )}
          </button>
        );
      }
    }
    
    // CHECKED_IN status: Show Check Out button
    if (visitor.status === 'CHECKED_IN') {
      buttons.push(
        <button
          key="checkout"
          onClick={() => handleStatusUpdate(visitor.id, 'CHECKED_OUT', 'checkout')}
          disabled={loadingActions[`${visitor.id}-checkout`]}
          className="px-2 py-1 text-xs text-gray-600 border border-gray-600 rounded hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingActions[`${visitor.id}-checkout`] ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            'Check Out'
          )}
        </button>
      );
    }
    
    // REJECTED status: No buttons (stays rejected)
    // CHECKED_OUT status: No buttons (visitor has left)
    
    return buttons;
  }, [loadingActions, handleStatusUpdate, handleReschedule]);

  const toggleDropdown = (visitorId) => {
    setOpenDropdown(openDropdown === visitorId ? null : visitorId);
  };

  return (
    <>
      <div className="px-6 py-4">
        <div className="overflow-hidden bg-transparent border border-gray-200 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Visitor Details
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Visit Info
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-gray-200">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No visitors found</p>
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                              <User className="w-5 h-5 text-purple-800" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex flex-col text-sm font-medium text-gray-900">
                              {visitor.visitor_name}
                              {(visitor.passId || visitor.pass_id) && (
                                <span className="text-xs text-gray-400">
                                  ID: {visitor.passId || visitor.pass_id}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {visitor.category_name && (
                            <span className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full">
                              {getCategoryLabel(visitor.category_name)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {visitor.mobile_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(visitor.visiting_date).toLocaleDateString()}
                            {visitor.status === 'PENDING' && isVisitingTimeInPast(visitor.visiting_date, visitor.visiting_time) && (
                              <span className="ml-2 px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded">Past</span>
                            )}
                          </div>
                          {visitor.visiting_time && (
                            <div className="flex items-center mb-1">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {visitor.visiting_time}
                            </div>
                          )}
                          {visitor.purpose_of_visit && (
                            <div className="mt-1 text-xs text-gray-500">
                              {visitor.purpose_of_visit}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!showRecurring && (
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(visitor.status)}`}></div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                              {visitor.status.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {showRecurring && (
                          <div className="text-sm text-gray-500">
                            <div>Active until:</div>
                            <div>{visitor.valid_until ? new Date(visitor.valid_until).toLocaleDateString() : 'No expiry'}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {!showRecurring && getActionButtons(visitor)}
                          <div className="relative" ref={dropdownRef}>
                            <button
                              onClick={() => toggleDropdown(visitor.id)}
                              className="p-1 text-gray-400 rounded-md hover:text-gray-600 hover:bg-gray-100"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openDropdown === visitor.id && (
                              <div className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                                <button
                                  onClick={() => handlePassGeneration(visitor.id, 'manual')}
                                  disabled={loadingActions[`${visitor.id}-manual`]}
                                  className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {loadingActions[`${visitor.id}-manual`] ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <FileText className="w-4 h-4 mr-2" />
                                  )}
                                  Manual Pass
                                </button>
                                <button
                                  onClick={() => handlePassGeneration(visitor.id, 'qr')}
                                  disabled={loadingActions[`${visitor.id}-qr`]}
                                  className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {loadingActions[`${visitor.id}-qr`] ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <div className="w-4 h-4 mr-2 border border-gray-400 rounded-sm">
                                      <div className="w-full h-full bg-gray-400 rounded-sm opacity-60"></div>
                                    </div>
                                  )}
                                  QR Pass
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Reschedule Visit
              </h3>
              <button
                onClick={closeRescheduleModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRescheduleSubmit} className="px-6 py-4">
              <div className="mb-4">
                <p className="mb-4 text-sm text-gray-600">
                  Reschedule visit for <strong>{rescheduleModal.visitor?.visitor_name}</strong>
                </p>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    New Visiting Date *
                  </label>
                  <input
                    type="date"
                    value={rescheduleModal.newDate}
                    onChange={(e) => setRescheduleModal(prev => ({ 
                      ...prev, 
                      newDate: e.target.value,
                      errors: { ...prev.errors, newDate: '' }
                    }))}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      rescheduleModal.errors.newDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {rescheduleModal.errors.newDate && (
                    <p className="mt-1 text-xs text-red-600">{rescheduleModal.errors.newDate}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    New Visiting Time *
                  </label>
                  <input
                    type="time"
                    value={rescheduleModal.newTime}
                    onChange={(e) => setRescheduleModal(prev => ({ 
                      ...prev, 
                      newTime: e.target.value,
                      errors: { ...prev.errors, newTime: '' }
                    }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      rescheduleModal.errors.newTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {rescheduleModal.errors.newTime && (
                    <p className="mt-1 text-xs text-red-600">{rescheduleModal.errors.newTime}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingActions[`${rescheduleModal.visitor?.id}-reschedule`]}
                  className="flex-1 px-4 py-2 text-sm font-medium text-purple-800 bg-white border border-purple-800 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingActions[`${rescheduleModal.visitor?.id}-reschedule`] ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Rescheduling...
                    </div>
                  ) : (
                    'Reschedule'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorTable;