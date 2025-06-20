import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Download, Eye, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../Auth/api'; // Import your API service similar to LoginForm

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [downloadLoading, setDownloadLoading] = useState('');
  
  const [monthlyData, setMonthlyData] = useState({
    year: new Date().getFullYear(),
    type: ''
  });
  
  const [customData, setCustomData] = useState({
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    type: ''
  });

  // Generate last 3 years
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  // Generate current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  // Update time when dates change
  useEffect(() => {
    if (customData.fromDate && !customData.fromTime) {
      setCustomData(prev => ({ ...prev, fromTime: getCurrentTime() }));
    }
    if (customData.toDate && !customData.toTime) {
      setCustomData(prev => ({ ...prev, toTime: getCurrentTime() }));
    }
  }, [customData.fromDate, customData.toDate]);

  // Validation functions
  const validateMonthlyData = () => {
    const newErrors = {};
    
    if (!monthlyData.year) {
      newErrors.year = 'Please select a year';
    }
    
    if (!monthlyData.type) {
      newErrors.type = 'Please select a report type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCustomData = () => {
    const newErrors = {};
    
    if (!customData.fromDate) {
      newErrors.fromDate = 'Please select from date';
    }
    
    if (!customData.toDate) {
      newErrors.toDate = 'Please select to date';
    }
    
    if (!customData.type) {
      newErrors.customType = 'Please select a report type';
    }
    
    if (customData.fromDate && customData.toDate) {
      const fromDateTime = new Date(`${customData.fromDate}T${customData.fromTime || '00:00'}`);
      const toDateTime = new Date(`${customData.toDate}T${customData.toTime || '23:59'}`);
      
      if (fromDateTime >= toDateTime) {
        newErrors.dateRange = 'From date and time must be before to date and time';
      }
      
      // Check if date range is not too far in the future
      const now = new Date();
      if (toDateTime > now) {
        newErrors.futureDate = 'Cannot generate reports for future dates';
      }
      
      // Check if date range is not too large (e.g., more than 1 year)
      const daysDiff = (toDateTime - fromDateTime) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        newErrors.dateRange = 'Date range cannot exceed 365 days';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call for monthly report
  const handleMonthlySubmit = async (format) => {
    if (!validateMonthlyData()) {
      return;
    }

    setDownloadLoading(format);
    setErrors({});

    try {
      const reportData = {
        reportType: 'monthly',
        year: monthlyData.year,
        type: monthlyData.type,
        format: format.toUpperCase()
      };

      console.log('Generating monthly report:', reportData);

      // API call to generate monthly report
      let response;
      if (format === 'excel') {
        response = await api.reports.generateMonthlyExcel(reportData);
      } else if (format === 'pdf') {
        response = await api.reports.generateMonthlyPdf(reportData);
      }

      // Handle file download
      if (response && response.data) {
        // If the response contains a file blob
        if (response.data instanceof Blob) {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = `monthly_report_${monthlyData.year}_${monthlyData.type}.${format}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } 
        // If the response contains a download URL
        else if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        }
        // If the response contains file data
        else if (response.data.fileData) {
          const link = document.createElement('a');
          link.href = response.data.fileData;
          link.download = response.data.fileName || `monthly_report_${monthlyData.year}_${monthlyData.type}.${format}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        
        // Show success message
        alert(`${format.toUpperCase()} Monthly Report generated successfully!`);
      }

    } catch (error) {
      console.error('Monthly report generation error:', error);
      
      let errorMessage = 'Failed to generate monthly report. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      
    } finally {
      setDownloadLoading('');
    }
  };

  // API call for custom report
  const handleCustomSubmit = async (format) => {
    if (!validateCustomData()) {
      return;
    }

    setDownloadLoading(format);
    setErrors({});

    try {
      const reportData = {
        reportType: 'custom',
        fromDate: customData.fromDate,
        fromTime: customData.fromTime || '00:00',
        toDate: customData.toDate,
        toTime: customData.toTime || '23:59',
        type: customData.type,
        format: format.toUpperCase()
      };

      console.log('Generating custom report:', reportData);

      // API call to generate custom report
      let response;
      if (format === 'excel') {
        response = await api.reports.generateCustomExcel(reportData);
      } else if (format === 'pdf') {
        response = await api.reports.generateCustomPdf(reportData);
      }

      // Handle file download (same logic as monthly report)
      if (response && response.data) {
        if (response.data instanceof Blob) {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = `custom_report_${customData.fromDate}_to_${customData.toDate}.${format}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } else if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        } else if (response.data.fileData) {
          const link = document.createElement('a');
          link.href = response.data.fileData;
          link.download = response.data.fileName || `custom_report_${customData.fromDate}_to_${customData.toDate}.${format}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        
        alert(`${format.toUpperCase()} Custom Report generated successfully!`);
      }

    } catch (error) {
      console.error('Custom report generation error:', error);
      
      let errorMessage = 'Failed to generate custom report. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      
    } finally {
      setDownloadLoading('');
    }
  };

  // API call for preview
  const handlePreview = async (reportType) => {
    let isValid = false;
    let previewData = {};

    if (reportType === 'monthly') {
      isValid = validateMonthlyData();
      previewData = {
        reportType: 'monthly',
        year: monthlyData.year,
        type: monthlyData.type
      };
    } else {
      isValid = validateCustomData();
      previewData = {
        reportType: 'custom',
        fromDate: customData.fromDate,
        fromTime: customData.fromTime || '00:00',
        toDate: customData.toDate,
        toTime: customData.toTime || '23:59',
        type: customData.type
      };
    }

    if (!isValid) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('Previewing report:', previewData);

      // API call to preview report
      const response = await api.reports.previewReport(previewData);

      if (response && response.data) {
        // Handle preview data
        if (response.data.previewUrl) {
          // Open preview in new tab
          window.open(response.data.previewUrl, '_blank');
        } else if (response.data.previewData) {
          // Handle inline preview data
          console.log('Preview data:', response.data.previewData);
          alert('Preview data received - check console for details');
        } else {
          alert('Preview generated successfully!');
        }
      }

    } catch (error) {
      console.error('Preview generation error:', error);
      
      let errorMessage = 'Failed to generate preview. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      
    } finally {
      setLoading(false);
    }
  };

  // Clear errors when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  // Clear specific errors when field values change
  const clearFieldError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <nav className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-12">
            <div className="flex items-center space-x-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-purple-800" />
                <span className="text-xl font-semibold text-gray-900">Reports</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="px-2 py-4 mx-auto max-w-7xl sm:px-4 lg:px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 mr-2" />
                Reports
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => handleTabChange('monthly')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'monthly'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Monthly Report
                </button>
                <button
                  onClick={() => handleTabChange('custom')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'custom'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Customized Report
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Tab Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'monthly' ? 'Monthly Report' : 'Customized Report'}
                </h1>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="flex items-center p-4 mx-6 mt-4 border border-red-200 rounded-lg bg-red-50">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  <span className="text-red-700">{errors.general}</span>
                </div>
              )}

              {/* Monthly Report Content */}
              {activeTab === 'monthly' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                    {/* Select Year */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Select Year *
                      </label>
                      <div className="relative">
                        <select
                          value={monthlyData.year}
                          onChange={(e) => {
                            setMonthlyData(prev => ({ ...prev, year: parseInt(e.target.value) }));
                            clearFieldError('year');
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                            errors.year ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Year</option>
                          {getYearOptions().map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                      </div>
                      {errors.year && (
                        <p className="mt-1 text-sm text-red-500">{errors.year}</p>
                      )}
                    </div>

                    {/* Select Type */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Select Type *
                      </label>
                      <div className="relative">
                        <select
                          value={monthlyData.type}
                          onChange={(e) => {
                            setMonthlyData(prev => ({ ...prev, type: e.target.value }));
                            clearFieldError('type');
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                            errors.type ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Type</option>
                          <option value="On Arrival">On Arrival</option>
                          <option value="Schedule">Schedule</option>
                        </select>
                        <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                      </div>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleMonthlySubmit('excel')}
                      disabled={downloadLoading === 'excel'}
                      className="flex items-center p-2 text-purple-800 transition-colors border border-purple-800 rounded-lg hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadLoading === 'excel' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download Excel
                    </button>
                    <button
                      onClick={() => handleMonthlySubmit('pdf')}
                      disabled={downloadLoading === 'pdf'}
                      className="flex items-center p-2 text-red-600 transition-colors border border-red-600 rounded-lg hover:bg-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadLoading === 'pdf' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download PDF
                    </button>
                    <button
                      onClick={() => handlePreview('monthly')}
                      disabled={loading}
                      className="flex items-center p-2 text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Report Content */}
              {activeTab === 'custom' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                    {/* From Date and Time */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        From Date *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={customData.fromDate}
                          onChange={(e) => {
                            setCustomData(prev => ({ 
                              ...prev, 
                              fromDate: e.target.value,
                              fromTime: e.target.value ? getCurrentTime() : ''
                            }));
                            clearFieldError('fromDate');
                            clearFieldError('dateRange');
                            clearFieldError('futureDate');
                          }}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.fromDate || errors.dateRange || errors.futureDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <input
                          type="time"
                          value={customData.fromTime}
                          onChange={(e) => {
                            setCustomData(prev => ({ ...prev, fromTime: e.target.value }));
                            clearFieldError('dateRange');
                          }}
                          className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {errors.fromDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.fromDate}</p>
                      )}
                    </div>

                    {/* To Date and Time */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        To Date *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={customData.toDate}
                          onChange={(e) => {
                            setCustomData(prev => ({ 
                              ...prev, 
                              toDate: e.target.value,
                              toTime: e.target.value ? getCurrentTime() : ''
                            }));
                            clearFieldError('toDate');
                            clearFieldError('dateRange');
                            clearFieldError('futureDate');
                          }}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.toDate || errors.dateRange || errors.futureDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <input
                          type="time"
                          value={customData.toTime}
                          onChange={(e) => {
                            setCustomData(prev => ({ ...prev, toTime: e.target.value }));
                            clearFieldError('dateRange');
                          }}
                          className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {errors.toDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.toDate}</p>
                      )}
                      {(errors.dateRange || errors.futureDate) && (
                        <p className="mt-1 text-sm text-red-500">{errors.dateRange || errors.futureDate}</p>
                      )}
                    </div>

                    {/* Select Type */}
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Select Type *
                      </label>
                      <div className="relative max-w-md">
                        <select
                          value={customData.type}
                          onChange={(e) => {
                            setCustomData(prev => ({ ...prev, type: e.target.value }));
                            clearFieldError('customType');
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                            errors.customType ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Type</option>
                          <option value="On Arrival">On Arrival</option>
                          <option value="Schedule">Schedule</option>
                        </select>
                        <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                      </div>
                      {errors.customType && (
                        <p className="mt-1 text-sm text-red-500">{errors.customType}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleCustomSubmit('excel')}
                      disabled={downloadLoading === 'excel'}
                      className="flex items-center p-2 text-purple-800 transition-colors border border-purple-800 rounded-lg hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadLoading === 'excel' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download Excel
                    </button>
                    <button
                      onClick={() => handleCustomSubmit('pdf')}
                      disabled={downloadLoading === 'pdf'}
                      className="flex items-center p-2 text-red-600 transition-colors border border-red-600 rounded-lg hover:bg-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadLoading === 'pdf' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download PDF
                    </button>
                    <button
                      onClick={() => handlePreview('custom')}
                      disabled={loading}
                      className="flex items-center p-2 text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Preview
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;