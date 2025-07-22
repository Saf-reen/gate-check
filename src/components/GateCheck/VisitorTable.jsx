import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../Auth/api';
import {
  Users, MoreVertical, Phone, Clock, User, Calendar, MapPin, Car, Mail,
  Building2, Loader2, X, Tag, FileText
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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setOpenDropdown(null);
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);
 

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
          break;
        case 'checkout':
          response = await api.visitors.checkout(visitorId);
          break;
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }

      if (response && response.data) {
        if (onVisitorUpdate) {
          onVisitorUpdate(visitorId, newStatus, actionType);
        }
      } else {
        throw new Error('No response data received');
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
    console.log("manual clicked")
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

  const getActionButtons = (visitor) => {
    const buttons = [];
    if (visitor.status === 'PENDING') {
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
    if (visitor.status === 'APPROVED') {
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
    return buttons;
  };

  const toggleDropdown = (visitorId) => {
    setOpenDropdown(openDropdown === visitorId ? null : visitorId);
  };

  return (
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
                                onClick={() => handlePassGeneration(visitor.id, 'manual')
                                  
                                }
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
  );
};

export default VisitorTable;
