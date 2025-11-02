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
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-4 h-4'
  };

  const paddingClasses = {
    sm: 'pl-7 pr-3',
    md: 'pl-8 pr-10 sm:pr-12',
    lg: 'pl-9 pr-4'
  };

  const baseClasses = variant === 'compact' 
    ? 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-0 focus:border-green-500 dark:focus:border-green-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all'
    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm';

  return (
    <div className={`relative ${className}`}>
      <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 ${iconSizeClasses[size]} z-10`} style={{ filter: 'none', backdropFilter: 'none' }} />
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
          className="absolute right-7 sm:right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
        >
          <X className={`${iconSizeClasses[size]}`} />
        </button>
      )}
    </div>
  );
};
