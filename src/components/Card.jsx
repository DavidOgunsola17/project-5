import { motion } from 'framer-motion';

export function Card({ children, className = '', onClick, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-white shadow-sm',
    blue: 'bg-blue-200',
    yellow: 'bg-yellow-300',
    purple: 'bg-purple-200',
    green: 'bg-green-200',
    orange: 'bg-orange-300',
    coral: 'bg-red-200',
    gray: 'bg-gray-200',
  };

  const baseClasses = `rounded-2xl p-6 ${variants[variant]}`;

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`${baseClasses} cursor-pointer transition-transform ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
