import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeGenerator = ({ tableNumber }) => {
  // Gunakan window.location.hostname untuk mendapatkan IP/domain saat ini
  const serverIP = window.location.hostname + (window.location.port ? ":" + window.location.port : "");
  
  // URL yang akan di-encode dalam QR code
  const loginUrl = `http://${serverIP}/login/${tableNumber}`;
  
  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG 
        value={loginUrl} 
        size={180} 
        level="H"
        includeMargin={true}
        bgColor="#FFFFFF"
        fgColor="#6F4E37"
        imageSettings={{
          src: '/logo192.png',
          x: undefined,
          y: undefined,
          height: 40,
          width: 40,
          excavate: true,
        }}
      />
      <div className="mt-2 text-sm">
        <p>Scan untuk melihat menu</p>
        <p className="font-medium">{loginUrl}</p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;