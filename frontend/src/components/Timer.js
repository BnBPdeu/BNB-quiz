import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ initialSeconds, onTimeUp, isActive }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep ref updated so interval always calls latest onTimeUp
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]); // ✅ no missing dependency warning

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (seconds < 60) return '#ff0000';
    if (seconds < 300) return '#ff6600';
    return '#333333';
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
