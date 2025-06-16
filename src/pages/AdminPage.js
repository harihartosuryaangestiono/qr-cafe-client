import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

// Gunakan variabel lingkungan atau window.location untuk mendapatkan URL server
const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
const socket = io(API_URL);

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    
    // Listen for new orders
    socket.on('orderNotification', (newOrder) => {
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    });
    
    // Listen for order status updates
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });
    
    return () => {
      socket.off('orderNotification');
      socket.off('orderStatusUpdated');
    };
  }, []);
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Make sure orderId is not undefined before making the request
      if (!orderId) {
        console.error('Order ID is undefined');
        return;
      }
      
      const response = await axios.patch(`${API_URL}/api/orders/${orderId}/status`, {
        status: newStatus
      });
      
      // Emit socket event for real-time update
      socket.emit('statusUpdate', response.data);
      
      // Update local state - make sure to use the same ID property consistently
      setOrders(orders.map(order => 
        order.id === orderId ? response.data : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Terjadi kesalahan saat mengubah status pesanan.');
    }
  };
  
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

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-light p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-primary text-white p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <Link to="/" className="bg-white text-primary px-4 py-2 rounded-lg font-medium">
                Kembali
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Daftar Pesanan</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada pesanan yang masuk.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Pesanan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelanggan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pembayaran
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Meja #{order.tableNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customerName || '-'}</div>
                          <div className="text-xs text-gray-500">{order.customerPhone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Rp {order.totalAmount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.paymentMethod === 'cash' ? 'Bayar di Kasir' : 'Pembayaran Online'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.paymentStatus === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openOrderDetail(order)}
                              className="text-indigo-600 hover:text-indigo-900 mr-2"
                            >
                              Lihat Detail
                            </button>
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'preparing')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Proses
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'completed')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Selesai
                              </button>
                            )}
                            {(order.status === 'pending' || order.status === 'preparing') && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Batalkan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Detail Pesanan #{selectedOrder.id.substring(0, 8).toUpperCase()}</h3>
              <button onClick={closeModal} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Informasi Pelanggan</p>
                  <p className="font-medium">Nama: {selectedOrder.customerName || '-'}</p>
                  <p className="font-medium">Telepon: {selectedOrder.customerPhone || '-'}</p>
                  <p className="font-medium">Meja: #{selectedOrder.tableNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Informasi Pesanan</p>
                  <p className="font-medium">Waktu: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p className="font-medium">Status: {getStatusText(selectedOrder.status)}</p>
                  <p className="font-medium">Pembayaran: {selectedOrder.paymentMethod === 'cash' ? 'Kasir' : 'Online'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Item Pesanan</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opsi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.OrderItems && selectedOrder.OrderItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">{item.MenuItem.name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">
                              {item.options ? (
                                <span>
                                  {item.options.temperature === 'ice' ? 'Ice' : 'Hot'}, 
                                  {item.options.sugar.charAt(0).toUpperCase() + item.options.sugar.slice(1)}
                                </span>
                              ) : '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">{item.quantity}x</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">{item.notes || '-'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">Rp {(item.MenuItem.price * item.quantity).toLocaleString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="font-bold text-lg">Total</div>
                <div className="font-bold text-xl text-primary">Rp {selectedOrder.totalAmount.toLocaleString()}</div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Tutup
                </button>
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, 'preparing');
                      closeModal();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Proses Pesanan
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, 'completed'); // Changed from _id to id
                      closeModal();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Selesaikan Pesanan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;