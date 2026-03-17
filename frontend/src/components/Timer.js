import React, { useState, useEffect } from 'react';

const Timer = ({ initialSeconds, onTimeUp, isActive }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let interval = null;
    
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isActive, onTimeUp]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (seconds < 60) return '#ff0000'; // Red - less than 1 minute
    if (seconds < 300) return '#ff6600'; // Orange - less than 5 minutes
    return '#333333'; // Dark gray - normal
  };

  return (
    <span style={{ 
      fontFamily: 'monospace',
      fontSize: '24px',
      fontWeight: '600',
      color: getColor()
    }}>
      {formatTime()}
    </span>
  );
};

export default Timer;