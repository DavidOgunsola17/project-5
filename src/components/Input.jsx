export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  autoFocus = false,
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`touch-target w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
        transition-all duration-200 ${className}`}
      {...props}
    />
  );
}
