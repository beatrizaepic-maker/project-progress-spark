import React from 'react';

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({ 
  label, 
  description, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">
        {label}
      </label>
      <input
        className={`w-full bg-[#1A1A2E]/60 border border-[#6A0DAD] rounded-none px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FF0066]/50 focus:border-[#FF0066] ${className}`}
        {...props}
      />
      {description && (
        <p className="text-xs text-[#C0C0C0]">
          {description}
        </p>
      )}
    </div>
  );
};

export { LabeledInput };