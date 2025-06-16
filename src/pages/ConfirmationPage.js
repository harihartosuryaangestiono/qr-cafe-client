import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { motion } from 'framer-motion';

// Gunakan variabel lingkungan atau window.location untuk URL server
const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
const socket = io(API_URL);

const ConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    
    // Listen for order status updates
    socket.on('orderStatusUpdated', (updatedOrder) => {
      if (updatedOrder.id === orderId) { // Perubahan dari _id menjadi id
        setOrder(updatedOrder);
      }
    });
    
    return () => {
      socket.off('orderStatusUpdated');
    };
  }, [orderId]);
  
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
          <Link to="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all">
            Kembali ke Menu
          </Link>
        </motion.div>
      </div>
    );
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu Konfirmasi';
      case 'preparing': return 'Sedang Diproses';
      case 'completed': return 'Pesanan Selesai';
      case 'cancelled': return 'Pesanan Dibatalkan';
      default: return status;
    }
  };
  
  return (
    <div className="min-h-screen bg-light p-4">
      <motion.div 
        className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-primary text-white p-6 text-center">
          <h2 className="text-2xl font-bold">Pesanan Berhasil!</h2>
          <p className="mt-2">Nomor Pesanan: #{order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A'}</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600">Meja #{order.tableNumber}</p>
              <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <motion.div 
              className={`px-4 py-2 rounded-full ${getStatusColor(order.status)}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {getStatusText(order.status)}
            </motion.div>
          </div>
          
          <div className="border-t border-b py-4 mb-4">
            <h3 className="font-semibold mb-3">Detail Pesanan</h3>
            {order.OrderItems.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex justify-between mb-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div>
                  <span className="font-medium">{item.quantity}x</span> {item.MenuItem.name}
                </div>
                <div>Rp {(item.MenuItem.price * item.quantity).toLocaleString()}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="flex justify-between font-bold text-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span>Total</span>
            <span>Rp {order.totalAmount.toLocaleString()}</span>
          </motion.div>
          
          <motion.div 
            className="bg-gray-100 p-4 rounded-lg mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-semibold mb-2">Metode Pembayaran</h3>
            <p>{order.paymentMethod === 'cash' ? 'Bayar di Kasir' : 'Pembayaran Online'}</p>
            <p className="mt-2 text-sm text-gray-600">
              Status Pembayaran: {order.paymentStatus === 'paid' ? 'Lunas' : 'Belum Dibayar'}
            </p>
          </motion.div>
          
          <div className="text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={`/menu/${order.tableNumber}`} 
                className="bg-primary text-white px-6 py-3 rounded-lg inline-block font-semibold hover:bg-opacity-90 transition-all"
              >
                Kembali ke Menu
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmationPage;