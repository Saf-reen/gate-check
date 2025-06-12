import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Download, Eye, ChevronDown } from 'lucide-react';

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('monthly');
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

  const handleMonthlySubmit = (format) => {
    if (!monthlyData.year || !monthlyData.type) {
      alert('Please select both year and type');
      return;
    }
    console.log(`Generating ${format} report for:`, monthlyData);
    alert(`Generating ${format.toUpperCase()} Monthly Report for ${monthlyData.year} - ${monthlyData.type}`);
  };

  const handleCustomSubmit = (format) => {
    if (!customData.fromDate || !customData.toDate || !customData.type) {
      alert('Please fill all required fields');
      return;
    }
    console.log(`Generating ${format} report for:`, customData);
    alert(`Generating ${format.toUpperCase()} Custom Report from ${customData.fromDate} to ${customData.toDate}`);
  };

  const handlePreview = (reportType) => {
    if (reportType === 'monthly') {
      if (!monthlyData.year || !monthlyData.type) {
        alert('Please select both year and type');
        return;
      }
      console.log('Previewing monthly report:', monthlyData);
      alert(`Previewing Monthly Report for ${monthlyData.year} - ${monthlyData.type}`);
    } else {
      if (!customData.fromDate || !customData.toDate || !customData.type) {
        alert('Please fill all required fields');
        return;
      }
      console.log('Previewing custom report:', customData);
      alert(`Previewing Custom Report from ${customData.fromDate} to ${customData.toDate}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12">
            <div className="flex items-center space-x-0">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">Reports</span>
              </div>
              {/* <div className="hidden sm:flex space-x-8">
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Dashboard</a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Visitors</a>
                <a href="#" className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">Reports</a>
              </div> */}
            </div>
          </div>
        </nav>
      </div>

      {/* Breadcrumb */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="#" className="text-gray-500 hover:text-gray-700">Gate Check</a>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-900 font-medium">Reports</span>
            </li>
          </ol>
        </nav>
      </div> */}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Reports
              </h2>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'monthly'
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  Monthly Report
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === 'custom'
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Customized Report
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Tab Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'monthly' ? 'Monthly Report' : 'Customized Report'}
                </h1>
              </div>

              {/* Monthly Report Content */}
              {activeTab === 'monthly' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Select Year */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Year *
                      </label>
                      <div className="relative">
                        <select
                          value={monthlyData.year}
                          onChange={(e) => setMonthlyData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                          <option value="">Select Year</option>
                          {getYearOptions().map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Select Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Type *
                      </label>
                      <div className="relative">
                        <select
                          value={monthlyData.type}
                          onChange={(e) => setMonthlyData(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                          <option value="">Select Type</option>
                          <option value="On Arrival">On Arrival</option>
                          <option value="Schedule">Schedule</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleMonthlySubmit('excel')}
                      className="flex items-center  border border-green-600 p-2 text-green-600 rounded-lg hover:bg-green-300 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Excel
                    </button>
                    <button
                      onClick={() => handleMonthlySubmit('pdf')}
                      className="flex items-center border border-red-600 p-2 text-red-600 rounded-lg hover:bg-red-300 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handlePreview('monthly')}
                      className="flex items-center border border-blue-600 p-2 text-blue-600 rounded-lg hover:bg-blue-300 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Report Content */}
              {activeTab === 'custom' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* From Date and Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={customData.fromDate}
                          onChange={(e) => setCustomData(prev => ({ 
                            ...prev, 
                            fromDate: e.target.value,
                            fromTime: e.target.value ? getCurrentTime() : ''
                          }))}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="time"
                          value={customData.fromTime}
                          onChange={(e) => setCustomData(prev => ({ ...prev, fromTime: e.target.value }))}
                          className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* To Date and Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={customData.toDate}
                          onChange={(e) => setCustomData(prev => ({ 
                            ...prev, 
                            toDate: e.target.value,
                            toTime: e.target.value ? getCurrentTime() : ''
                          }))}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="time"
                          value={customData.toTime}
                          onChange={(e) => setCustomData(prev => ({ ...prev, toTime: e.target.value }))}
                          className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Select Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Type *
                      </label>
                      <div className="relative max-w-md">
                        <select
                          value={customData.type}
                          onChange={(e) => setCustomData(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                        >
                          <option value="">Select Type</option>
                          <option value="On Arrival">On Arrival</option>
                          <option value="Schedule">Schedule</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleCustomSubmit('excel')}
                      className="flex items-center border border-green-600 p-2 text-green-600 rounded-lg hover:bg-green-300 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Excel
                    </button>
                    <button
                      onClick={() => handleCustomSubmit('pdf')}
                      className="flex items-center border border-red-600 p-2 text-red-600 rounded-lg hover:bg-red-300 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handlePreview('custom')}
                      className="flex items-center border border-blue-600 p-2 text-blue-600 rounded-lg hover:bg-blue-300 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
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



