import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, Plus, MoreVertical, Phone, Clock, User, Users, Upload, Download, ChevronDown, X, Calendar, MapPin, Car, Mail, Building2 } from 'lucide-react';

const GateCheck = ({ onVisitorCountChange }) => {
  const [visitors, setVisitors] = useState([]);
  const [recurringVisitors, setRecurringVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExcelDropdown, setShowExcelDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [nextId, setNextId] = useState(1);

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

  // Load initial data
  useEffect(() => {
    setLoading(false);
  }, []);

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
        visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.phone.includes(searchTerm) ||
        visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newVisitor = {
      id: nextId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      purpose: formData.purpose,
      hostName: formData.hostName,
      department: formData.department,
      company: formData.company,
      address: formData.address,
      belongings: formData.belongings,
      vehicleType: formData.vehicleType,
      vehicleNo: formData.vehicleNo,
      visitingDate: formData.visitingDate,
      visitingTime: formData.visitingTime,
      allowingHours: formData.allowingHours,
      category: formData.category,
      gender: formData.gender,
      status: 'in',
      type: 'schedule',
      checkInTime: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\//g, '-'),
      avatar: null
    };

    if (formData.recurringType === 'recurring') {
      setRecurringVisitors(prev => [...prev, { ...newVisitor, isRecurring: true }]);
    } else {
      setVisitors(prev => [...prev, newVisitor]);
    }

    setNextId(prev => prev + 1);
    setShowAddModal(false);
    
    // Reset form
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
  };

  const getStatusColor = (status) => {
    return status === 'in' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusDot = (status) => {
    return status === 'in' ? 'bg-green-500' : 'bg-red-500';
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'schedule': return 'Schedule';
      case 'walkin': return 'Walk-in';
      case 'visitor': return 'QR Visitor';
      default: return 'Unknown';
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
        `"${visitor.name}"`,
        `"${visitor.phone}"`, 
        `"${visitor.email || ''}"`,
        `"${visitor.status || 'Active'}"`,
        `"${getTypeLabel(visitor.type)}"`,
        `"${visitor.checkInTime}"`,
        `"${visitor.purpose}"`,
        `"${visitor.hostName}"`,
        `"${visitor.department}"`,
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`File "${file.name}" selected for upload. File parsing functionality would be implemented here.`);
      setShowExcelDropdown(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen m-0 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="flex items-center text-xl font-semibold text-gray-900">
                <Users className="w-6 h-6 m-2 text-green-600" />
                {showRecurring ? 'Recurring Visitors' : 'Visitors'}
              </h1>
              <button 
                onClick={() => setShowRecurring(!showRecurring)}
                className={`p-2 text-sm rounded-lg transition-colors ${
                  showRecurring 
                    ? 'text-white bg-green-600 hover:bg-green-700' 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {showRecurring ? 'Show Regular Visitors' : 'Recurring Pass'}
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center p-2 text-xs text-white transition-colors bg-green-600 rounded-lg hover:bg-green-800"
              >
                <Plus className="w-4 h-4" />
                Add Visitor
              </button>
              
              {/* Filter Dropdown */}
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
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
                        {visitor.purpose} - {visitor.hostName} ({visitor.department})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {visitor.checkInTime}
                    </div>
                    {visitor.status === 'out' && visitor.checkOutTime && (
                      <div className="flex items-center mt-1 text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {visitor.checkOutTime}
                      </div>
                    )}
                  </div>

                  {!showRecurring && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(visitor.status)}`}>
                      {visitor.status === 'in' ? 'In' : 'Out'}
                    </span>
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
                <h2 className="text-lg font-semibold text-gray-900">Add Visitor</h2>
                <p className="text-sm text-gray-500">Pass ID - {String(nextId).padStart(6, '0')}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Person Details Section */}
              <div className="space-y-4">
                <h3 className="flex items-center text-sm font-medium text-gray-900">
                  <User className="w-4 h-4 mr-2" />
                  Person Details
                </h3>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Recurring Pass <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="recurringType"
                      value={formData.recurringType}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="onetime">ONE TIME</option>
                      <option value="recurring">RECURRING</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Visiting Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="visitingDate"
                      value={formData.visitingDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Visiting Time
                    </label>
                    <input
                      type="time"
                      name="visitingTime"
                      value={formData.visitingTime}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: 8989899900"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Visitor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Visitor Name"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Allowing Hours
                    </label>
                    <select
                      name="allowingHours"
                      value={formData.allowingHours}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="6">6</option>
                      <option value="8">8</option>
                      <option value="12">12</option>
                      <option value="24">24</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="NA">NA</option>
                      <option value="business">Business</option>
                      <option value="personal">Personal</option>
                      <option value="delivery">Delivery</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email Id
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ex: company@gmail.com"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Whom to meet
                  </label>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      name="hostName"
                      value={formData.hostName}
                      onChange={handleInputChange}
                      placeholder="Host Name"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Department"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Coming From
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    From Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Belongings/ Tools
                  </label>
                  <textarea
                    name="belongings"
                    value={formData.belongings}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Purpose of visit
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="Ex: Meeting etc..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div className="space-y-4">
                <h3 className="flex items-center text-sm font-medium text-gray-900">
                  <Car className="w-4 h-4 mr-2" />
                  Vehicle Details
                </h3>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Vehicle Type
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                      <option value="truck">Truck</option>
                      <option value="van">Van</option>
                      <option value="auto">Auto</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      name="vehicleNo"
                      value={formData.vehicleNo}
                      onChange={handleInputChange}
                      placeholder="Ex: AP 09 XX 1234"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end pt-6 space-x-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Add Visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateCheck;