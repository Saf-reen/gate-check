import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Download, Printer } from 'lucide-react';
import { api } from '../../Auth/api';
import ReactDOM from 'react-dom/client';

const QRCode = () => {
  const { state } = useLocation();
  const { visitor } = state || {};
  const navigate = useNavigate();
  const qrImageRef = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const token= localStorage.getItem('authToken');

  useEffect(() => {
    const fetchVisitorQRCode = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.visitors.getQR(visitor.id,{
        headers: {
          Authorization: `Bearer ${token}`,
        }});
        console.log(visitor.id)
        console.log(response)
        if (response?.data?.qr_code_url) {
          setQrCodeUrl(response.data.qr_code_url);
        } else {
          setError('QR Code not available for this visitor.');
        }
      } catch (err) {
        console.error('Error fetching QR code:', err);
        const errorMessage = err.response?.data?.message || 'Failed to fetch QR Code. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (visitor?.id) {
      fetchVisitorQRCode();
    } else {
      setLoading(false);
      setError('Visitor ID is missing.');
    }
  }, [visitor]);

  const handleDownload = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${visitor.name || visitor.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading QR code:', err);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      navigate(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  if (!visitor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="p-6 bg-white rounded-lg">
          <div className="text-center text-red-500">
            No visitor data available. Please try again.
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-4 py-2 mt-4 text-white bg-purple-600 rounded hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="p-6 bg-white border-2 border-purple-800 rounded-lg w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h2 id="qr-modal-title" className="text-xl font-semibold text-gray-900">
            QR Code Pass
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 rounded hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Visitor Info */}
        <div className="mb-4 text-center">
          <h3 className="font-medium text-gray-800">{visitor.name || 'Visitor'}</h3>
          {(visitor.email || visitor.phone) && (
            <p className="text-sm text-gray-600">{visitor.email || visitor.phone}</p>
          )}
        </div>
        {/* QR Code Display */}
        <div className="flex justify-center mb-4">
          {loading ? (
            <div className="flex items-center justify-center w-48 h-48 bg-gray-200 rounded-lg">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading QR Code...</p>
              </div>
            </div>
          ) : qrCodeUrl ? (
            <div className="p-4 border-2 border-gray-200 rounded-lg">
              <img
                ref={qrImageRef}
                src={qrCodeUrl}
                alt={`QR Code for ${visitor.name || 'visitor'} entry pass`}
                className="object-contain w-48 h-48"
                onError={() => setError('Failed to load QR code image.')}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-48 h-48 bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg">
              <p className="p-4 text-sm text-center text-red-500">{error}</p>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        {qrCodeUrl && !loading && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Download QR code"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
        {/* Instructions */}
        <div className="p-3 mt-4 rounded-lg bg-purple-50">
          <p className="text-xs text-center text-purple-800">
            Present this QR code at the entrance for quick access
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCode;
