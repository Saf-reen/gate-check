import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, User, Phone, Mail, Calendar, Clock, Building2, Tag } from 'lucide-react';

const ManualPass = () => {
  const { state } = useLocation();
  const { visitor } = state || {};
  const navigate = useNavigate();

  if (!visitor) {
    return <div>No visitor data available.</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 border-4 purple-800 border-">
      <div className="p-6 bg-white rounded-lg w-96">
        <div className="flex items-center justify-between mb-4 border-b-2 border-purple-800">
          <h2 className="pb-4 text-xl font-semibold text-gray-900">Manual Pass</h2>
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5 pb-2" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-400" />
            <div>
              <p className="font-medium">{visitor.visitor_name}</p>
              <p className="text-sm text-gray-500">{visitor.passId || visitor.pass_id}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2 text-gray-400" />
            <p>{visitor.mobile_number}</p>
          </div>
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2 text-gray-400" />
            <p>{visitor.email_id}</p>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-400" />
            <p>{new Date(visitor.visiting_date).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-400" />
            <p>{visitor.visiting_time}</p>
          </div>
          {/* <div className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-gray-400" />
            <p>{visitor.coming_from}</p>
          </div>
          <div className="flex items-center">
            <Tag className="w-5 h-5 mr-2 text-gray-400" />
            <p>{visitor.purpose_of_visit}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ManualPass;
