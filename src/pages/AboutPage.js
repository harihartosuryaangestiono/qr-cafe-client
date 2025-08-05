import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-light p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-primary text-white p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Tentang Proyek</h1>
              <Link to="/" className="bg-white text-primary px-4 py-2 rounded-lg font-medium">
                Kembali
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cafe QR Order System</h2>
            
            <div className="prose max-w-none">
              <p>
                Cafe QR Order System adalah aplikasi pemesanan makanan dan minuman berbasis web yang menggunakan teknologi QR Code untuk memudahkan pelanggan memesan dari meja mereka.
              </p>
              
              <h3>Fitur Utama:</h3>
              <ul>
                <li>Pemesanan melalui QR Code untuk setiap meja</li>
                <li>Sistem login pelanggan dengan informasi dasar</li>
                <li>Katalog menu dengan kategori dan pencarian</li>
                <li>Keranjang belanja dengan opsi kustomisasi</li>
                <li>Sistem pembayaran (simulasi)</li>
                <li>Panel admin untuk mengelola pesanan</li>
                <li>Notifikasi real-time menggunakan Socket.io</li>
                <li>Riwayat pesanan pelanggan</li>
              </ul>
              
              <h3>Teknologi yang Digunakan:</h3>
              <ul>
                <li>Frontend: React.js, Tailwind CSS, Framer Motion</li>
                <li>Backend: Node.js, Express.js</li>
                <li>Database: PostgreSQL dengan Sequelize ORM</li>
                <li>Real-time: Socket.io</li>
                <li>Autentikasi: JWT</li>
              </ul>
              
              <h3>Pengembang:</h3>
              <p>
                Proyek ini dikembangkan oleh [Nama Anda] sebagai bagian dari portofolio pengembangan web fullstack.
              </p>
              
              <div className="mt-8">
                <h3>Kontak:</h3>
                <p>
                  Email: <a href="mailto:hariharto.surya@gmail.com" className="text-primary hover:underline">hariharto.surya@gmail.com</a><br />
                  GitHub: <a href="https://github.com/harihartoSurya" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/harihartoSurya</a><br />
                  LinkedIn: <a href="https://linkedin.com/in/Hari" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">linkedin.com/in/username</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;