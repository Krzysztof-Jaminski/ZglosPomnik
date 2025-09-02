import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '',
  disabled = false,
  variant = 'secondary',
  size = 'sm',
  className = '',
  title
}) => {
  const baseClasses = `
    relative overflow-hidden
    backdrop-blur-md
    border-l-4 border-transparent
    rounded-lg
    font-medium
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-green-500/50
    shadow-lg hover:shadow-xl
    group
    ${className}
  `;

  const variantClasses = {
    primary: `
      bg-green-800/30 hover:bg-green-700/50 active:bg-blue-600/70
      text-green-900 hover:text-green-800 active:text-blue-900
      hover:border-l-green-500 active:border-l-blue-500
      dark:bg-gray-800/50 dark:hover:bg-gray-700/60 dark:active:bg-gray-600/70
      dark:text-gray-300 dark:hover:text-white
      dark:hover:border-l-green-500
    `,
    secondary: `
      bg-green-800/20 hover:bg-green-700/40 active:bg-blue-600/60
      text-green-800 hover:text-green-700 active:text-blue-800
      hover:border-l-green-400 active:border-l-blue-400
      dark:bg-gray-800/30 dark:hover:bg-gray-700/50 dark:active:bg-gray-600/60
      dark:text-gray-400 dark:hover:text-gray-200
      dark:hover:border-l-green-400
    `,
    danger: `
      bg-red-800/20 hover:bg-red-900/40 active:bg-red-800/50
      text-red-700 hover:text-red-600 active:text-red-800
      hover:border-l-red-500 active:border-l-red-600
      dark:bg-gray-800/30 dark:hover:bg-red-900/40 dark:active:bg-red-800/50
      dark:text-red-400 dark:hover:text-red-300
      dark:hover:border-l-red-500
    `
  };

  const sizeClasses = {
    xs: 'px-3 py-2 text-base',
    sm: 'px-4 py-3 text-lg',
    md: 'px-6 py-4 text-xl',
    lg: 'px-8 py-6 text-2xl'
  };

  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  return (
    <div className="relative">
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
        whileHover={{ scale: disabled ? 1 : 1.02, x: disabled ? 0 : 2 }}
        whileTap={{ scale: disabled ? 1 : 0.98, x: disabled ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Green left border highlight on hover */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
        
        {/* Select */}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          title={title}
          className="w-full bg-transparent border-none outline-none cursor-pointer appearance-none pr-8 text-inherit"
          style={{
            colorScheme: 'dark'
          }}
        >
          {placeholder && (
            <option value="" disabled className="bg-gray-800 text-gray-300">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800 text-gray-300">
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron Down Icon */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`${iconSizes[size]} text-gray-600 dark:text-gray-400`} />
        </div>
      </motion.div>
    </div>
  );
};
