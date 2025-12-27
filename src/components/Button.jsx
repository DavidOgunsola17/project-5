import { motion } from 'framer-motion';

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseClasses = 'touch-target font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
