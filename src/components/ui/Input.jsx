function Input({ label, error, className = '', ...props }) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        className={`h-11 rounded-xl border border-slate-200 bg-white/95 px-3 text-sm outline-none ring-blue-200 transition focus:border-blue-500 focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  )
}

export default Input
