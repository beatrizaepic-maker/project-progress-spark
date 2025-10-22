import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
}

const SelectInput: React.FC<SelectInputProps> = ({ 
  label, 
  description, 
  options, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">
        {label}
      </label>
      <select
        className={`w-full bg-[#1A1A2E]/60 border border-[#6A0DAD] rounded-none px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FF0066]/50 focus:border-[#FF0066] ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description && (
        <p className="text-xs text-[#C0C0C0]">
          {description}
        </p>
      )}
    </div>
  );
};

export { SelectInput };