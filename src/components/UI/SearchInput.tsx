import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  showClearButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  showClearButton = true,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'py-1.5 text-xs',
    md: 'py-1.5 sm:py-2 text-xs sm:text-sm',
    lg: 'py-1.5 text-sm'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const paddingClasses = {
    sm: 'pl-7 pr-3',
    md: 'pl-8 pr-4',
    lg: 'pl-9 pr-4'
  };

  const baseClasses = variant === 'compact' 
    ? 'border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-gray-400 dark:bg-gray-800 dark:text-white transition-all'
    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm';

  return (
    <div className={`relative ${className}`}>
      <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSizeClasses[size]}`} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${paddingClasses[size]} ${sizeClasses[size]} ${baseClasses}`}
      />
      {showClearButton && value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className={`${iconSizeClasses[size]}`} />
        </button>
      )}
    </div>
  );
};
