function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition ${
        checked ? 'bg-emerald-500' : 'bg-slate-300'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
      <span className="sr-only">{label ?? 'Toggle'}</span>
    </button>
  )
}

export default Toggle
