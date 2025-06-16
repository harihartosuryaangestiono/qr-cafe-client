import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-light flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-primary text-white p-6 text-center">
          <h1 className="text-3xl font-bold">Selamat Datang</h1>
          <p className="mt-2">Sistem Pemesanan Cafe dengan QR Code</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Silakan pilih opsi di bawah ini untuk melanjutkan:
            </p>
          </div>
          
          <Link 
            to="/qrcode" 
            className="block w-full bg-primary hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold transition-colors text-center"
          >
            Generate QR Code
          </Link>
          
          <Link 
            to="/admin" 
            className="block w-full bg-secondary hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors text-center"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;