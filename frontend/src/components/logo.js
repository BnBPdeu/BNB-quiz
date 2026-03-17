import React from 'react';

const Logo = ({ size = 40 }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <img 
        src="/bnblogo.png" 
        alt="Bulls & Bears Logo"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain'
        }}
      />
      <span style={{
        fontSize: `${size/2.5}px`,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: '1px'
      }}>
        BULLS & BEARS
      </span>
    </div>
  );
};

export default Logo;