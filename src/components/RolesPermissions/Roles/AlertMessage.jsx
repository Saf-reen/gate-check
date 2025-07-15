import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AlertMessage = ({ message, type = 'error' }) => {
  if (!message) return null;

  return (
    <div className={`p-4 rounded-lg mb-4 flex items-center gap-2 ${
      type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    }`}>
      {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
      <span>{message}</span>
    </div>
  );
};

export default AlertMessage;
