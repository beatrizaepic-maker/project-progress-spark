import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LivingNebulaShader from '../effects/LivingNebulaShader';

interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isVisible, 
  onComplete, 
  duration = 3000 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
          style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
          }}
        >
          {/* Efeito Nebuloso de Fundo - O charme do projeto! */}
          <div className="absolute inset-0 opacity-60">
            <LivingNebulaShader />
          </div>

          {/* Overlay escuro sutil para melhor contraste */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-purple-900/30" />

          {/* Container Principal do Logo */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Logo Principal com Animações Épicas */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: [0, 1.1, 1], 
                rotate: [- 180, 0, 0], 
                opacity: [0, 1, 1] 
              }}
              transition={{ 
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.6, 1]
              }}
              className="relative mb-8"
            >
              {/* Glow Effect atrás do Logo */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-3xl"
                style={{ transform: 'scale(1.5)' }}
              />

              {/* Logo */}
              <motion.img
                src="/LOGOEPIC.png"
                alt="EPIC Logo"
                className="w-[500px] h-[500px] object-contain relative z-10 drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(147, 51, 234, 0.5))'
                }}
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Círculos de Loading ao redor do Logo */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 w-[520px] h-[520px] border-2 border-purple-500/30 rounded-full"
                style={{ borderStyle: 'dashed' }}
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 w-[540px] h-[540px] border border-blue-500/20 rounded-full"
                style={{ borderStyle: 'dotted' }}
              />
            </motion.div>

            {/* Texto de Carregamento */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-center"
            >
              <motion.h2
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-3xl font-bold text-white mb-4 tracking-wider"
                style={{
                  fontFamily: 'Ethnocentric, sans-serif',
                  textShadow: '0 0 20px rgba(147, 51, 234, 0.7)'
                }}
              >
                EPIC PROJECT SPARK
              </motion.h2>

              {/* Barra de Progresso Animada */}
              <div className="w-80 h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: duration / 1000,
                    ease: "easeInOut"
                  }}
                  className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 rounded-full"
                  style={{
                    boxShadow: '0 0 20px rgba(147, 51, 234, 0.6)'
                  }}
                />
              </div>

              {/* Texto de Status */}
              <motion.p
                animate={{ 
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-slate-300 text-lg font-medium tracking-wide"
              >
                Carregando Sistema de Gestão...
              </motion.p>

              {/* Pontos de Loading */}
              <div className="flex justify-center space-x-2 mt-4">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-3 h-3 bg-purple-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Partículas Flutuantes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100,
                  opacity: 0
                }}
                animate={{ 
                  y: -100,
                  opacity: [0, 1, 0],
                  x: Math.random() * window.innerWidth
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                className="absolute w-2 h-2 bg-purple-400/30 rounded-full blur-sm"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
