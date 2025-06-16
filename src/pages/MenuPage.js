import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MenuItem from '../components/MenuItem';
import Cart from '../components/Cart';

// Tambahkan kode berikut di awal fungsi MenuPage
const MenuPage = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [customerInfo, setCustomerInfo] = useState(null);
  
  // Tambahkan state untuk pop-up
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    temperature: 'hot',
    sugar: 'normal'
  });
  
  // Daftar minuman yang memerlukan opsi tambahan
  const drinksWithOptions = ['cafe latte', 'caramel macchiato', 'americano', 'lemon tea'];
  
  useEffect(() => {
    // Cek apakah pelanggan sudah login
    const storedCustomerInfo = localStorage.getItem('customerInfo');
    
    if (!storedCustomerInfo) {
      // Jika belum login, redirect ke halaman login
      navigate(`/login/${tableNumber}`);
      return;
    }
    
    setCustomerInfo(JSON.parse(storedCustomerInfo));
    
    // Kode fetch menu items tetap sama
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
        
        // Then in fetchMenuItems function
        const response = await axios.get(`${API_URL}/api/menu`);
        setMenuItems(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [tableNumber, navigate]);
  
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);
  
  const addToCart = (item) => {
    // Cek apakah item adalah minuman yang memerlukan opsi tambahan
    if (drinksWithOptions.includes(item.name.toLowerCase())) {
      setSelectedItem(item);
      setShowOptionsModal(true);
    } else {
      addItemToCart(item);
    }
  };
  
  const addItemToCart = (item, options = null) => {
    const itemWithOptions = options ? { ...item, options } : item;
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id && 
      JSON.stringify(cartItem.options) === JSON.stringify(options)
    );
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...itemWithOptions, quantity: 1 }]);
    }
  };
  
  const handleOptionSelect = (option, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  const handleConfirmOptions = () => {
    addItemToCart(selectedItem, selectedOptions);
    setShowOptionsModal(false);
    setSelectedItem(null);
    setSelectedOptions({ temperature: 'hot', sugar: 'normal' });
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Cafe Menu</h1>
          <div className="bg-accent text-dark px-4 py-2 rounded-full font-medium shadow-soft">
            Meja #{tableNumber}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto p-4 pb-32">
        <div className="bg-card rounded-xl shadow-soft p-2 mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 min-w-max">
            <motion.button 
              className={`px-6 py-3 rounded-lg font-medium transition-all ${activeCategory === 'all' ? 'bg-primary text-white shadow-soft' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveCategory('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Semua
            </motion.button>
            {categories.map(category => (
              <motion.button 
                key={category}
                className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeCategory === category ? 'bg-primary text-white shadow-soft' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map(item => (
              <MenuItem 
                key={item.id} 
                item={item} 
                onAddToCart={() => addToCart(item)} 
              />
            ))}
          </motion.div>
        )}
        
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-700">Tidak ada menu dalam kategori ini</h3>
          </div>
        )}
      </div>
      
      {cart.length > 0 && (
        <Cart 
          items={cart} 
          setCart={setCart} 
          tableNumber={tableNumber} 
        />
      )}
      
      {/* Modal untuk opsi minuman */}
      <AnimatePresence>
        {showOptionsModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOptionsModal(false)}
          >
            <motion.div 
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">{selectedItem?.name}</h3>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Pilih Temperatur:</h4>
                <div className="flex gap-3">
                  <button 
                    className={`px-4 py-2 rounded-lg border ${selectedOptions.temperature === 'hot' ? 'bg-primary text-white' : 'bg-white'}`}
                    onClick={() => handleOptionSelect('temperature', 'hot')}
                  >
                    Hot
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg border ${selectedOptions.temperature === 'ice' ? 'bg-primary text-white' : 'bg-white'}`}
                    onClick={() => handleOptionSelect('temperature', 'ice')}
                  >
                    Ice
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Pilih Level Gula:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className={`px-4 py-2 rounded-lg border ${selectedOptions.sugar === 'no sugar' ? 'bg-primary text-white' : 'bg-white'}`}
                    onClick={() => handleOptionSelect('sugar', 'no sugar')}
                  >
                    No Sugar
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg border ${selectedOptions.sugar === 'less sugar' ? 'bg-primary text-white' : 'bg-white'}`}
                    onClick={() => handleOptionSelect('sugar', 'less sugar')}
                  >
                    Less Sugar
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg border ${selectedOptions.sugar === 'normal' ? 'bg-primary text-white' : 'bg-white'}`}
                    onClick={() => handleOptionSelect('sugar', 'normal')}
                  >
                    Normal Sugar
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-lg border ${selectedOptions.sugar === 'extra sugar' ? 'bg-primary text-white' : 'bg-white'}`}
                    onClick={() => handleOptionSelect('sugar', 'extra sugar')}
                  >
                    Extra Sugar
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 rounded-lg border bg-gray-200"
                  onClick={() => setShowOptionsModal(false)}
                >
                  Batal
                </button>
                <button 
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                  onClick={handleConfirmOptions}
                >
                  Tambahkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;