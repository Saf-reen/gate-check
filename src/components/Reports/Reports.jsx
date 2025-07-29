import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Download, Eye, ChevronDown, Loader2, AlertCircle, X, User, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { api } from '../Auth/api';

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [downloadLoading, setDownloadLoading] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  // New state for year-month selection
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyReports, setMonthlyReports] = useState({});

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const getMonthsForYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const months = [];
    for (let i = 1; i <= 12; i++) {
      // Only show months up to current month if it's the current year
      if (selectedYear === currentYear && i > currentMonth) {
        break;
      }
      months.push({
        number: i,
        name: getMonthName(i),
        fullName: `${getMonthName(i)} ${selectedYear}`
      });
    }
    return months;
  };

  useEffect(() => {
    if (customData.fromDate && !customData.fromTime) {
      setCustomData(prev => ({ ...prev, fromTime: getCurrentTime() }));
    }
    if (customData.toDate && !customData.toTime) {
      setCustomData(prev => ({ ...prev, toTime: getCurrentTime() }));
    }
  }, [customData.fromDate, customData.toDate]);

  const validateMonthlyData = () => {
    const newErrors = {};

    if (!monthlyData.year) {
      newErrors.year = 'Please select a year';
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

    if (customData.fromDate && customData.toDate) {
      const fromDateTime = new Date(`${customData.fromDate}T${customData.fromTime || '00:00'}`);
      const toDateTime = new Date(`${customData.toDate}T${customData.toTime || '23:59'}`);

      if (fromDateTime >= toDateTime) {
        newErrors.dateRange = 'From date and time must be before to date and time';
      }

      const now = new Date();
      if (toDateTime > now) {
        newErrors.futureDate = 'Cannot generate reports for future dates';
      }

      const daysDiff = (toDateTime - fromDateTime) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        newErrors.dateRange = 'Date range cannot exceed 365 days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // New function to handle month-specific actions
  // Updated handleMonthAction function to handle preview the same way as handlePreview
  const handleMonthAction = async (year, month, action, format = null) => {
    const actionKey = `${year}-${month}-${action}-${format || ''}`;
    setDownloadLoading(actionKey);
    setErrors({});

    try {
      let response;
      const params = { 'year': year, 'month': month };
      console.log(params);

      if (action === 'preview') {
        response = await api.reports.previewMonthlyReport({year, month});
        
        // Handle preview response the same way as handlePreview function
        if (response && response.data) {
          if (response.data.previewUrl) {
            window.open(response.data.previewUrl, '_blank');
          } else if (response.data instanceof Blob) {
            const url = window.URL.createObjectURL(response.data);
            window.open(url, '_blank');
            window.URL.revokeObjectURL(url);
          } else if (response.data.previewData) {
            setPreviewData(response.data.previewData);
            setShowPreview(true);
          } else if (Array.isArray(response.data)) {
            setPreviewData(response.data);
            setShowPreview(true);
          } else {
            console.log('Preview data:', response.data);
            setPreviewData(response.data);
            setShowPreview(true);
          }
        }
      } else if (action === 'download') {
          if (format === 'xls') {
            response = await api.reports.generateMonthlyExcel(
              { year, month, responseType: 'blob' }
            );
            console.log(response.data);
          } else if (format === 'pdf') {
            response = await api.reports.generateMonthlyPdf(
              { year, month, responseType: 'blob' }
            );
          }

        // --- Error blob handling here ---
        if (response && response.data instanceof Blob) {
          if (response.data.type === 'application/json') {
            const text = await response.data.text();
            console.error('Error response:', text);
            let errorJson;
            try {
              errorJson = JSON.parse(text);
            } catch {
              errorJson = { error: text };
            }
            setErrors({
              general: errorJson.error || errorJson.message || 'Failed to download monthly report.',
            });
            setDownloadLoading('');
            return; // Stop here, don't try to download!
          }

          // Valid file, download as before:
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Monthly_Report_${year}_${month.toString().padStart(2, '0')}.${format}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          alert(`${format.toUpperCase()} Monthly Report for ${getMonthName(month)} ${year} generated successfully!`);
        }
      }
    } catch (error) {
      console.error(`Monthly ${action} error:`, error);

      let errorMessage = `Failed to ${action} monthly report. Please try again.`;

      // Handle error blob in catch (if thrown here)
      if (error.response?.data instanceof Blob && error.response.data.type === 'application/json') {
        const text = await error.response.data.text();
        try {
          const errorJson = JSON.parse(text);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = text;
        }
      }
      else if (error.response?.data?.error) {
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
        format: format.toUpperCase()
      };
      console.log('Generating monthly report:', reportData);
      let response;
      if (format === 'xls') {
        response = await api.reports.generateMonthlyExcel(reportData);
      } else if (format === 'pdf') {
        response = await api.reports.generateMonthlyPdf(reportData);
      }

      if (response && response.data) {
        if (response.data instanceof Blob) {
          const url = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = url;
          link.download = `monthly_report_${monthlyData.year}_${monthlyData.type}.${format}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } else if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        } else if (response.data.fileData) {
          const link = document.createElement('a');
          link.href = response.data.fileData;
          link.download = response.data.fileName || `monthly_report_${monthlyData.year}_${monthlyData.type}.${format}`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }

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
      let response;
      if (format === 'xls') {
        response = await api.reports.generateCustomExcel(reportData);
      } else if (format === 'pdf') {
        response = await api.reports.generateCustomPdf(reportData);
      }

      console.log(response)
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

  const handlePreview = async (reportType) => {
    let isValid = false;
    let previewReportData = {};
    if (reportType === 'monthly') {
      isValid = validateMonthlyData();
      previewReportData = {
        reportType: 'monthly',
        year: monthlyData.year,
        type: monthlyData.type
      };
    } else {
      isValid = validateCustomData();
      previewReportData = {
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
    setPreviewLoading(true);
    setErrors({});
    try {
      console.log('Previewing report:', previewReportData);
      const response = await api.reports.previewReport(previewReportData);
      
      if (response && response.data) {
        if (response.data.previewUrl) {
          window.open(response.data.previewUrl, '_blank');
        } else if (response.data instanceof Blob) {
          const url = window.URL.createObjectURL(response.data);
          window.open(url, '_blank');
          window.URL.revokeObjectURL(url);
        } else if (response.data.previewData) {
          setPreviewData(response.data.previewData);
          setShowPreview(true);
        } else if (Array.isArray(response.data)) {
          setPreviewData(response.data);
          setShowPreview(true);
        } else {
          console.log('Preview data:', response.data);
          setPreviewData(response.data);
          setShowPreview(true);
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
      setPreviewLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setShowPreview(false);
    setPreviewData(null);
  };

  const clearFieldError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;

    if (Array.isArray(previewData)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Preview Data ({previewData.length} records)
            </h3>
            <div className="text-sm text-gray-500">
              {activeTab === 'monthly' 
                ? `Year: ${monthlyData.year}, Type: ${monthlyData.type}`
                : `${customData.fromDate} to ${customData.toDate}, Type: ${customData.type}`
              }
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-96">
            <div className="grid gap-4">
              {previewData.map((record, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.name || record.visitor_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Visitor Name</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.phone || record.contact_number || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Phone</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.email || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Email</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.company || record.organization || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Company</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(record.visit_date || record.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">Visit Date</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${
                        record.status === 'approved' ? 'bg-green-500' : 
                        record.status === 'rejected' ? 'bg-red-500' : 
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {record.status || 'Pending'}
                        </div>
                        <div className="text-xs text-gray-500">Status</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (typeof previewData === 'object') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Preview Data</h3>
          <div className="p-4 rounded-lg bg-gray-50">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Preview Data</h3>
        <div className="p-4 rounded-lg bg-gray-50">
          <div className="text-sm text-gray-700">
            {previewData.toString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="lg:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-sm">
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
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'monthly' ? 'Monthly Report' : 'Customized Report'}
                </h1>
              </div>
              
              {errors.general && (
                <div className="flex items-center p-4 mx-6 mt-4 border border-red-200 rounded-lg bg-red-50">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  <span className="text-red-700">{errors.general}</span>
                </div>
              )}
              
              {activeTab === 'monthly' && (
                <div className="p-6">
                  {/* Year Selection */}
                  <div className="mb-8">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Select Year *
                    </label>
                    <div className="relative max-w-xs">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {getYearOptions().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
                    </div>
                  </div>

                  {/* Months Grid */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Monthly Reports for {selectedYear}
                    </h3>
                    <div className="grid gap-4">
                      {getMonthsForYear().map((month) => (
                        <div key={month.number} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-purple-600" />
                              <h4 className="text-lg font-medium text-gray-900">
                                {month.fullName}
                              </h4>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleMonthAction(selectedYear, month.number, 'download', 'xls')}
                                disabled={downloadLoading === `${selectedYear}-${month.number}-download-xls`}
                                className="flex items-center px-3 py-2 text-sm text-green-800 transition-colors border border-green-800 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadLoading === `${selectedYear}-${month.number}-download-xls` ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4 mr-1" />
                                )}
                                Excel
                              </button>
                              <button
                                onClick={() => handleMonthAction(selectedYear, month.number, 'download', 'pdf')}
                                disabled={downloadLoading === `${selectedYear}-${month.number}-download-pdf`}
                                className="flex items-center px-3 py-2 text-sm text-red-600 transition-colors border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadLoading === `${selectedYear}-${month.number}-download-pdf` ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4 mr-1" />
                                )}
                                PDF
                              </button>
                              <button
                                onClick={() => handleMonthAction(selectedYear, month.number, 'preview')}
                                disabled={downloadLoading === `${selectedYear}-${month.number}-preview-`}
                                className="flex items-center px-3 py-2 text-sm text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadLoading === `${selectedYear}-${month.number}-preview-` ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Eye className="w-4 h-4 mr-1" />
                                )}
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legacy monthly report section - keeping for backward compatibility */}
                  {/* <div className="pt-8 mt-12 border-t border-gray-200">
                    <h3 className="mb-6 text-lg font-semibold text-gray-900">Legacy Monthly Report</h3>
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
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
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => handleMonthlySubmit('xls')}
                        disabled={downloadLoading === 'xls'}
                        className="flex items-center px-4 py-2 text-green-800 transition-colors border border-green-800 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadLoading === 'xls' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download Excel
                      </button>
                      <button
                        onClick={() => handleMonthlySubmit('pdf')}
                        disabled={downloadLoading === 'pdf'}
                        className="flex items-center px-4 py-2 text-red-600 transition-colors border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={previewLoading}
                        className="flex items-center px-4 py-2 text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {previewLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 mr-2" />
                        )}
                        Preview
                      </button>
                    </div>
                  </div> */}
                </div>
              )}
              
              {activeTab === 'custom' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        From Date *
                      </label>
                      <input
                        type="date"
                        value={customData.fromDate}
                        onChange={(e) => {
                          setCustomData(prev => ({ ...prev, fromDate: e.target.value }));
                          clearFieldError('fromDate');
                          clearFieldError('dateRange');
                          clearFieldError('futureDate');
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.fromDate || errors.dateRange || errors.futureDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.fromDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.fromDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        From Time
                      </label>
                      <input
                        type="time"
                        value={customData.fromTime}
                        onChange={(e) => {
                          setCustomData(prev => ({ ...prev, fromTime: e.target.value }));
                          clearFieldError('dateRange');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        To Date *
                      </label>
                      <input
                        type="date"
                        value={customData.toDate}
                        onChange={(e) => {
                          setCustomData(prev => ({ ...prev, toDate: e.target.value }));
                          clearFieldError('toDate');
                          clearFieldError('dateRange');
                          clearFieldError('futureDate');
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.toDate || errors.dateRange || errors.futureDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.toDate && (
                        <p className="mt-1 text-sm text-red-500">{errors.toDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        To Time
                      </label>
                      <input
                        type="time"
                        value={customData.toTime}
                        onChange={(e) => {
                          setCustomData(prev => ({ ...prev, toTime: e.target.value }));
                          clearFieldError('dateRange');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {(errors.dateRange || errors.futureDate) && (
                    <div className="mb-6">
                      {errors.dateRange && (
                        <p className="text-sm text-red-500">{errors.dateRange}</p>
                      )}
                      {errors.futureDate && (
                        <p className="text-sm text-red-500">{errors.futureDate}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleCustomSubmit('xls')}
                      disabled={downloadLoading === 'xls'}
                      className="flex items-center px-4 py-2 text-green-800 transition-colors border border-green-800 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadLoading === 'xls' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download Excel
                    </button>
                    <button
                      onClick={() => handleCustomSubmit('pdf')}
                      disabled={downloadLoading === 'pdf'}
                      className="flex items-center px-4 py-2 text-red-600 transition-colors border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={previewLoading}
                      className="flex items-center px-4 py-2 text-blue-600 transition-colors border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {previewLoading ? (
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
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Report Preview</h2>
              <button
                onClick={closePreview}
                className="p-2 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              {renderPreviewContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;