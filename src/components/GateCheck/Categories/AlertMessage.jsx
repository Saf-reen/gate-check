import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const AlertMessage = ({ message, type = 'error', onClose }) => {
  if (!message) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-500'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: AlertCircle,
          iconColor: 'text-yellow-500'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: AlertCircle,
          iconColor: 'text-blue-500'
        };
    }
  };

  const { container, icon: Icon, iconColor } = getAlertStyles();

  return (
    <div className={`border rounded-lg p-4 mb-4 ${container}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${iconColor}`} />
          <span className="text-sm font-medium">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;