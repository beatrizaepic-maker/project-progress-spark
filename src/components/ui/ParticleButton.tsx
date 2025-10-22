import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

const ParticleButton: React.FC<ParticleButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default', 
  size = 'default',
  ...props 
}) => {
  const [showParticles, setShowParticles] = useState(false);
  const [buttonDimensions, setButtonDimensions] = useState({ width: 0, height: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonDimensions({
        width: rect.width,
        height: rect.height
      });
    }
    
    setShowParticles(true);
    if (onClick) onClick(e);
    setTimeout(() => setShowParticles(false), 1600);
  };

  const getButtonClasses = () => {
    let baseClasses = "relative overflow-hidden font-semibold rounded-none shadow-lg transition-all ";
    let sizeClasses = "";
    let variantClasses = "";

    switch (size) {
      case 'sm':
        sizeClasses = "px-3 py-1 text-xs ";
        break;
      case 'lg':
        sizeClasses = "px-6 py-3 text-lg ";
        break;
      default:
        sizeClasses = "px-4 py-2 ";
    }

    switch (variant) {
      case 'secondary':
        variantClasses = "bg-gray-500 hover:bg-gray-600 text-white ";
        break;
      default:
        variantClasses = "bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105 ";
    }

    return baseClasses + sizeClasses + variantClasses + className;
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={getButtonClasses()}
      {...props}
    >
      {children}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 23 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#FF0066] rounded-full"
              initial={{
                x: buttonDimensions.width / 2,
                y: buttonDimensions.height / 2,
                scale: 0,
                opacity: 1
              }}
              animate={{
                x: [
                  buttonDimensions.width / 2 + (Math.random() - 0.5) * buttonDimensions.width * 1.5,
                  buttonDimensions.width / 2 + (Math.random() - 0.5) * buttonDimensions.width * 2
                ],
                y: [
                  buttonDimensions.height / 2 + (Math.random() - 0.5) * buttonDimensions.height * 1.5,
                  buttonDimensions.height / 2 + (Math.random() - 0.5) * buttonDimensions.height * 2
                ],
                scale: [0, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </button>
  );
};

export { ParticleButton };