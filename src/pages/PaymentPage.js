import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// Gunakan variabel lingkungan atau window.location untuk URL server
const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('processing');
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  const simulatePayment = () => {
    setPaymentStatus('processing');
    
    // Simulasi proses pembayaran
    setTimeout(async () => {
      try {
        // Update status pembayaran
        // eslint-disable-next-line no-unused-vars
        const response = await axios.patch(`${API_URL}/api/orders/${orderId}/payment`, {
          paymentStatus: 'paid'
        });
        
        setPaymentStatus('success');
        
        // Redirect ke halaman konfirmasi setelah 2 detik
        setTimeout(() => {
          navigate(`/confirmation/${orderId}`);
        }, 2000);
      } catch (error) {
        console.error('Error updating payment status:', error);
        setPaymentStatus('failed');
      }
    }, 3000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <motion.div 
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">Pesanan tidak ditemukan</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Kembali ke Menu
          </button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-light p-4">
      <motion.div 
        className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-primary text-white p-6 text-center">
          <h2 className="text-2xl font-bold">Pembayaran Online</h2>
          <p className="mt-2">Nomor Pesanan: #{order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A'}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Detail Pesanan</h3>
            <p className="text-gray-600">Meja #{order.tableNumber}</p>
            <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="border-t border-b py-4 mb-4">
            {order.OrderItems.map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{item.quantity}x</span> {item.MenuItem.name}
                </div>
                <div>Rp {(item.MenuItem.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>Rp {order.totalAmount.toLocaleString()}</span>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-4">Metode Pembayaran</h3>
            
            <div className="space-y-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer bg-white">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={true}
                  className="mr-3 text-primary focus:ring-primary h-5 w-5"
                  readOnly
                />
                <div className="flex-1">
                  <p className="font-medium">Transfer Bank</p>
                  <p className="text-sm text-gray-500">Pembayaran instan melalui transfer bank</p>
                </div>
                <img src="/logo192.png" alt="Bank" className="h-8" />
              </label>
            </div>
          </div>
          
          {paymentStatus === 'idle' && (
            <motion.button
              onClick={simulatePayment}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Bayar Sekarang
            </motion.button>
          )}
          
          {paymentStatus === 'processing' && (
            <div className="text-center py-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary mx-auto mb-3"></div>
              <p className="text-gray-600">Memproses pembayaran...</p>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="text-center py-3 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">Pembayaran Berhasil!</p>
              <p className="text-sm">Mengalihkan ke halaman konfirmasi...</p>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="text-center py-3">
              <div className="text-red-600 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Pembayaran Gagal</p>
              <p className="text-gray-600 text-sm mb-4">Silakan coba lagi atau pilih metode pembayaran lain</p>
              
              <motion.button
                onClick={simulatePayment}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Coba Lagi
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;