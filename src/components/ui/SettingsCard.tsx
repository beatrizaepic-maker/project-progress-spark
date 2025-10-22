import React from 'react';
import { motion } from 'framer-motion';

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  description, 
  icon, 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {description && <p className="text-sm text-[#C0C0C0] mb-4">{description}</p>}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
};

export { SettingsCard };