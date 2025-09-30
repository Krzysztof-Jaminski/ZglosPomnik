import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
  title?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  title
}) => {
  const { triggerLightHaptic } = useHapticFeedback();
  const baseClasses = `
    relative overflow-hidden
    backdrop-blur-md
    border-l-4 border-transparent
    rounded-lg
    font-medium
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none
    shadow-lg hover:shadow-xl
    group
    ${className}
  `;

  const variantClasses = {
    primary: `
      bg-white/80 hover:bg-white/90 active:bg-white/95
      text-gray-800 hover:text-gray-900 active:text-gray-900
      hover:border-l-green-500 active:border-l-green-600
      dark:bg-gray-800/50 dark:hover:bg-gray-700/60 dark:active:bg-gray-600/70
      dark:text-gray-300 dark:hover:text-white
      dark:hover:border-l-green-500
      focus:ring-0
    `,
    secondary: `
      bg-white/60 hover:bg-white/70 active:bg-white/80
      text-gray-700 hover:text-gray-800 active:text-gray-900
      hover:border-l-blue-400 active:border-l-blue-500
      dark:bg-gray-800/30 dark:hover:bg-gray-700/50 dark:active:bg-gray-600/60
      dark:text-gray-400 dark:hover:text-gray-200
      dark:hover:border-l-green-400
      focus:ring-0
    `,
    danger: `
      bg-white/70 hover:bg-white/80 active:bg-white/90
      text-red-600 hover:text-red-700 active:text-red-800
      hover:border-l-red-500 active:border-l-red-600
      dark:bg-gray-800/30 dark:hover:bg-red-900/40 dark:active:bg-red-800/50
      dark:text-red-400 dark:hover:text-red-300
      dark:hover:border-l-red-500
      focus:ring-2 focus:ring-red-500/50
    `
  };

  const sizeClasses = {
    xs: 'px-3 py-2 text-base',
    sm: 'px-4 py-3 text-lg',
    md: 'px-6 py-4 text-xl',
    lg: 'px-8 py-6 text-2xl'
  };

  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleClick = () => {
    if (!disabled) {
      triggerLightHaptic();
      onClick?.();
    }
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      whileHover={{ scale: disabled ? 1 : 1.02, x: disabled ? 0 : 4 }}
      whileTap={{ scale: disabled ? 1 : 0.98, x: disabled ? 0 : 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Left border highlight on hover */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ${
        variant === 'danger' ? 'bg-red-500' : 'bg-green-500'
      }`} />
      
      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {Icon && <Icon className={`${iconSizes[size]} stroke-2`} />}
        <span>{children}</span>
      </div>
    </motion.button>
  );
};