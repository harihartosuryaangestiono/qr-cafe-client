import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCodeGenerator from '../components/QRCodeGenerator';

const QRCodePage = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [generatedQRs, setGeneratedQRs] = useState([]);
  
  const handleGenerateQR = (e) => {
    e.preventDefault();
    
    if (!tableNumber) return;
    
    // Check if table number already exists
    if (generatedQRs.some(qr => qr.tableNumber === tableNumber)) {
      alert('Nomor meja ini sudah dibuat QR code-nya!');
      return;
    }
    
    // Add new QR code to the list
    setGeneratedQRs([...generatedQRs, { tableNumber, timestamp: Date.now() }]);
    setTableNumber('');
  };
  
  return (
    <div className="min-h-screen bg-light p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-primary text-white p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">QR Code Generator</h1>
              <Link to="/" className="bg-white text-primary px-4 py-2 rounded-lg font-medium">
                Kembali
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleGenerateQR} className="flex space-x-4 mb-8">
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Masukkan nomor meja"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                required
              />
              <button 
                type="submit"
                className="bg-primary hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Generate QR
              </button>
            </form>
            
            {generatedQRs.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">QR Code yang Dihasilkan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedQRs.map((qr) => (
                    <div key={qr.timestamp} className="bg-gray-50 p-4 rounded-lg text-center">
                      <h3 className="font-medium mb-2">Meja #{qr.tableNumber}</h3>
                      <QRCodeGenerator tableNumber={qr.tableNumber} />
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(qr.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;