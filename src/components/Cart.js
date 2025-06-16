import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

// Gunakan variabel lingkungan atau window.location untuk mendapatkan URL server
const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
const socket = io(API_URL);

// Komponen CartItem untuk menampilkan item dalam keranjang
const CartItem = ({ item, onQuantityChange }) => {
  return (
    <motion.div 
      layout
      className="flex justify-between items-center py-3 border-b border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 250, 251, 0.5)" }}
    >
      <div className="flex-1">
        <h4 className="font-medium">{item.name}</h4>
        {item.options && (
          <p className="text-xs text-gray-500">
            {item.options.temperature === 'ice' ? 'Ice' : 'Hot'}, 
            {item.options.sugar.charAt(0).toUpperCase() + item.options.sugar.slice(1)}
          </p>
        )}
        {item.notes && <p className="text-xs italic text-gray-400">Note: {item.notes}</p>}
      </div>
      <div className="flex items-center">
        <span className="text-primary font-medium mr-3">Rp {(item.price * item.quantity).toLocaleString()}</span>
        <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
          <motion.button 
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </motion.button>
          <span className="w-6 text-center font-medium">{item.quantity}</span>
          <motion.button 
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const Cart = ({ items, setCart, tableNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(items.filter(item => item.id !== id));
    } else {
      setCart(items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };
  
  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      // Ambil data pelanggan dari localStorage
      const customerInfo = JSON.parse(localStorage.getItem('customerInfo'));
      
      const orderItems = items.map(item => ({
        menuItem: item.id,
        quantity: item.quantity,
        notes: item.notes || null,
        options: item.options || null // Tambahkan opsi ke data pesanan
      }));
      
      const orderData = {
        tableNumber: parseInt(tableNumber),
        items: orderItems.map(item => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          notes: item.notes || null,
          // Make sure options is properly formatted
          options: item.options ? JSON.stringify(item.options) : null
        })),
        totalAmount,
        paymentMethod,
        customerName: customerInfo?.name || '',
        customerPhone: customerInfo?.phone || ''
      };
      
      const response = await axios.post(`${API_URL}/api/orders`, orderData);
      
      // Emit socket event for real-time notification
      socket.emit('newOrder', response.data);
      
      // Clear cart
      setCart([]);
      
      // Redirect berdasarkan metode pembayaran
      if (paymentMethod === 'online') {
        navigate(`/payment/${response.data.id}`);
      } else {
        navigate(`/confirmation/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        alert(`Error: ${error.response.data.message || 'Unknown error'}`); 
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        alert('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-card shadow-lg z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto p-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-soft">
              {totalItems}
            </div>
            <span className="font-semibold text-lg">Pesanan Anda</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold mr-3 text-lg">Rp {totalAmount.toLocaleString()}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg 
                className="w-6 h-6 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {items.map(item => (
                    <CartItem 
                      key={`${item.id}-${JSON.stringify(item.options || '')}`} 
                      item={item} 
                      onQuantityChange={handleQuantityChange} 
                    />
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Metode Pembayaran */}
              <div className="mb-6 mt-4">
                <h3 className="font-medium mb-3 text-gray-700">Metode Pembayaran</h3>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 ${paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('cash')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${paymentMethod === 'cash' ? 'text-primary' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029zM6 12a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm7.283 3.283A1 1 0 0112 15H8a1 1 0 01-.707-1.707l.129-.13c.394-.391.91-.63 1.464-.63H11.114c.554 0 1.07.239 1.464.63l.129.13a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <span className={`font-medium ${paymentMethod === 'cash' ? 'text-primary' : 'text-gray-700'}`}>Kasir</span>
                  </motion.button>
                  
                  <motion.button
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 ${paymentMethod === 'online' ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('online')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${paymentMethod === 'online' ? 'text-primary' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    <span className={`font-medium ${paymentMethod === 'online' ? 'text-primary' : 'text-gray-700'}`}>Online</span>
                  </motion.button>
                </div>
              </div>
              
              {/* Tombol Checkout */}
              <motion.button 
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
                onClick={handleCheckout}
                disabled={isProcessing}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Pesan Sekarang · Rp {totalAmount.toLocaleString()}</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Cart;