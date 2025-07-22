import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '../../Auth/api';

const QRCode = () => {
  const { state } = useLocation();
  const { visitor } = state || {};
  const navigate = useNavigate();

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVisitorQRCode = async () => {
      try {
        setLoading(true);
        const response = await api.visitors.getQR(visitor.id);
        if (response?.data?.qr_code_url) {
          setQrCodeUrl(response.data.qr_code_url);
        } else {
          setError('QR Code not available.');
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError('Failed to fetch QR Code.');
      } finally {
        setLoading(false);
      }
    };

    if (visitor) {
      fetchVisitorQRCode();
    }
  }, [visitor]);

  if (!visitor) {
    return <div className="text-center text-red-500">No visitor data available.</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 bg-white border-2 border-purple-800 rounded-lg w-96">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">QR Code Pass</h2>
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center w-32 h-32 bg-gray-200">
              <p className="text-sm text-gray-500">Loading QR Code...</p>
            </div>
          ) : qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="QR Code for Visitor Entry Pass"
              className="w-32 h-32"
            />
          ) : (
            <div className="flex items-center justify-center w-32 h-32 bg-gray-100">
              <p className="text-sm text-center text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCode;
