import React from 'react';
import { X, Loader2, User, Phone, Mail, Calendar, Clock, Building2, Car, Tag } from 'lucide-react';

const VisitorForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  setShowAddModal,
  resetForm,
  errors,
  submitLoading,
  categories,
  categoriesLoading,
  user // Add user as a prop
}) => {
  // Set the default value for the "coming_from" field if it's not already set
React.useEffect(() => {
  if (user?.company && !formData.coming_from) {
    // Instead of calling resetForm, directly call handleInputChange
    handleInputChange({
      target: {
        name: 'coming_from',
        value: user.company
      }
    });
  }
}, [user, formData.coming_from, handleInputChange]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Visitor</h2>
          <button
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Visitor Name *
                </label>
                <input
                  type="text"
                  name="visitor_name"
                  value={formData.visitor_name}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.visitor_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter visitor name"
                />
                {errors.visitor_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.visitor_name}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Mobile Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.mobile_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.mobile_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile_number}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Email Address <span className='text-red-500'>*</span>
                </label>
                <input
                  type="email"
                  name="email_id"
                  value={formData.email_id}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.email_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.email_id}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Gender <span className='text-red-500'>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>
            </div>
          </div>
          {/* Visit Details */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Visit Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Pass Type <span className='text-red-500'>*</span>
                </label>
                <select
                  name="pass_type"
                  value={formData.pass_type}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.pass_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="ONE_TIME">One Time</option>
                  <option value="RECURRING">Recurring</option>
                  <option value="PERMANENT">Permanent</option>
                </select>
                {errors.pass_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.pass_type}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Category <span className='text-red-500'>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={categoriesLoading}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Visiting Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type="date"
                  name="visiting_date"
                  value={formData.visiting_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.visiting_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.visiting_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.visiting_date}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Visiting Time <span className='text-red-500'>*</span>
                </label>
                <input
                  type="time"
                  name="visiting_time"
                  value={formData.visiting_time}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.visiting_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.visiting_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.visiting_time}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Allowing Hours <span className='text-red-500'>*</span>
                </label>
                <input
                  type="number"
                  name="allowing_hours"
                  value={formData.allowing_hours}
                  onChange={handleInputChange}
                  min="1"
                  max="24"
                  className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.allowing_hours ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Hours allowed (1-24)"
                />
                {errors.allowing_hours && (
                  <p className="mt-1 text-sm text-red-600">{errors.allowing_hours}</p>
                )}
              </div>
              {/* Recurring specific fields */}
              {formData.pass_type === 'RECURRING' && (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Recurring Days <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type="number"
                      name="recurring_days"
                      value={formData.recurring_days}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.recurring_days ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Number of days"
                    />
                    {errors.recurring_days && (
                      <p className="mt-1 text-sm text-red-600">{errors.recurring_days}</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Valid Until <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type="date"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleInputChange}
                      min={formData.visiting_date || new Date().toISOString().split('T')[0]}
                      className={`w-full p-2 text-sm border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.valid_until ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.valid_until && (
                      <p className="mt-1 text-sm text-red-600">{errors.valid_until}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Relationship & Purpose */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Relationship & Purpose</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Whom to Meet
                </label>
                <input
                  type="text"
                  name="whom_to_meet"
                  value={formData.whom_to_meet}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Person/department to meet"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Coming From
                </label>
                <input
                  type="text"
                  name="coming_from"
                  value={formData.coming_from}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Company/organization name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Purpose of Visit <span className='text-red-500'>*</span>
                </label>
                <textarea
                  name="purpose_of_visit"
                  value={formData.purpose_of_visit}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full p-2 text-sm border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.purpose_of_visit ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the purpose of visit"
                />
                {errors.purpose_of_visit && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose_of_visit}</p>
                )}
              </div>
            </div>
          </div>
          {/* Security & Additional Details */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Security & Additional Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Belongings/Tools
                </label>
                <input
                  type="text"
                  name="belongings_tools"
                  value={formData.belongings_tools}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Items being carried"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Security Notes
                </label>
                <input
                  type="text"
                  name="security_notes"
                  value={formData.security_notes}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any security observations"
                />
              </div>
            </div>
          </div>
          {/* Vehicle Information */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Vehicle Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Vehicle Type
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select vehicle type</option>
                  <option value="CAR">Car</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="BICYCLE">Bicycle</option>
                  <option value="TRUCK">Truck</option>
                  <option value="VAN">Van</option>
                  <option value="BUS">Bus</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter vehicle number"
                />
              </div>
            </div>
          </div>
          {/* Form Actions */}
          <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-purple-800 bg-white border border-purple-800 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Visitor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitorForm;