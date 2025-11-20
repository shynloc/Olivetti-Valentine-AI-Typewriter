import React, { useEffect, useState } from 'react';

const Cursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: `translate(-30%, -10%) scale(${isPressed ? 0.9 : 1})`
      }}
    >
      {/* SVG Hand Cursor */}
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
        <g transform={isPressed ? "translate(5, 5)" : "translate(0,0)"}>
          {/* Skin */}
          <path 
            d="M20 50 L20 30 Q20 10 40 10 L40 50" 
            stroke="black" strokeWidth="4" fill="#ffccaa"
            className={isPressed ? "opacity-0" : "opacity-100"}
          />
           {/* Index Finger (Pointing) */}
           <path 
            d="M35 55 L35 15 Q35 5 45 5 Q55 5 55 15 L55 55" 
            stroke="black" strokeWidth="4" fill="#ffccaa"
          />
          {/* Hand Body */}
          <path 
            d="M20 50 C20 80 30 95 60 95 L80 95 L80 60 L55 55 L35 55" 
            stroke="black" strokeWidth="4" fill="#ffccaa"
          />
          {/* Knuckles/Fingers folded */}
          <path d="M55 55 L60 50 L70 50 L80 60" stroke="black" strokeWidth="4" fill="#ffccaa" />
          <path d="M60 50 L60 60" stroke="black" strokeWidth="2" />
          <path d="M70 50 L70 60" stroke="black" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

export default Cursor;