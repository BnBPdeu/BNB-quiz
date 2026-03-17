
import React from 'react';
import Logo from './logo';

const RulesPage = ({ onAccept }) => {
  const handleAccept = () => {
    onAccept();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        padding: '30px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Logo size={60} />
        </div>
        
        <h1 style={{ 
          fontSize: '32px', 
          marginBottom: '20px', 
          color: '#1a202c',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          Quiz Rules
        </h1>
        
        <div style={{ marginBottom: '30px' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px',
              color: '#4a5568',
              fontSize: '16px'
            }}>
              <span style={{ color: '#1a202c', fontSize: '20px', fontWeight: '600' }}>•</span>
              <span><strong style={{ color: '#1a202c' }}>25 questions</strong> • 30 minutes total time</span>
            </li>
            <li style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px',
              color: '#4a5568',
              fontSize: '16px'
            }}>
              <span style={{ color: '#1a202c', fontSize: '20px', fontWeight: '600' }}>•</span>
              <span>One question at a time - <strong style={{ color: '#1a202c' }}>cannot go back</strong></span>
            </li>
            <li style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px',
              color: '#4a5568',
              fontSize: '16px'
            }}>
              <span style={{ color: '#1a202c', fontSize: '20px', fontWeight: '600' }}>•</span>
              <span>Must answer current question to proceed</span>
            </li>
            <li style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px',
              color: '#ffffff',
              fontSize: '16px',
              backgroundColor: '#ff0000',
              padding: '15px',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span><strong>CRITICAL: Tab switching will END your quiz after 2 violations!</strong></span>
            </li>
            <li style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px',
              color: '#4a5568',
              fontSize: '16px'
            }}>
              <span style={{ color: '#1a202c', fontSize: '20px', fontWeight: '600' }}>•</span>
              <span>Quiz will start in FULLSCREEN mode</span>
            </li>
            <li style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px',
              color: '#4a5568',
              fontSize: '16px'
            }}>
              <span style={{ color: '#1a202c', fontSize: '20px', fontWeight: '600' }}>•</span>
              <span>No copy/paste or right-click allowed</span>
            </li>
            <li style={{ 
              marginBottom: '16px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px',
              color: '#4a5568',
              fontSize: '16px'
            }}>
              <span style={{ color: '#1a202c', fontSize: '20px', fontWeight: '600' }}>•</span>
              <span>Quiz auto-submits when time ends</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleAccept}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#000000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          I Understand & Start Quiz
        </button>
      </div>
    </div>
  );
};

export default RulesPage;