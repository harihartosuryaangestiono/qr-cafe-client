import React from 'react';
import { motion } from 'framer-motion';

// Tambahkan variabel API_URL
const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;

const MenuItem = ({ item, onAddToCart }) => {
  const { name, description, price, image, category } = item;
  
  // Gunakan API_URL untuk URL gambar
  const imageUrl = image.startsWith('http') ? image : `${API_URL}/images/${image}`;
  
  return (
    <motion.div 
      className="bg-card rounded-2xl shadow-card overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-3 right-3 bg-accent text-dark px-3 py-1 rounded-full text-xs font-medium">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-dark">{name}</h3>
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">{description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-primary font-bold text-lg">Rp {price.toLocaleString()}</span>
          <button 
            onClick={onAddToCart}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 transform hover:translate-y-[-2px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Tambah
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItem;