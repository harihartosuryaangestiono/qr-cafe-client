import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import ConfirmationPage from './pages/ConfirmationPage';
import PaymentPage from './pages/PaymentPage';
import AdminPage from './pages/AdminPage';
import QRCodePage from './pages/QRCodePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/:tableNumber" element={<LoginPage />} />
        <Route path="/menu/:tableNumber" element={<MenuPage />} />
        <Route path="/confirmation/:orderId" element={<ConfirmationPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/qrcode" element={<QRCodePage />} />
      </Routes>
    </Router>
  );
}

export default App;
