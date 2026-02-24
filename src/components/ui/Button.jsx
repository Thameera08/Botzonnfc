function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-[0_8px_16px_rgba(15,111,255,0.28)]',
    secondary: 'bg-white text-slate-800 border border-blue-100 hover:bg-blue-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? 'Please wait...' : props.children}
    </button>
  )
}

export default Button
