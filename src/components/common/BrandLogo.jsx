function BrandLogo({ className = '', compact = false, dark = false }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/connectme-logo.svg"
        alt="ConnectMe"
        className={compact ? 'h-9 w-auto' : 'h-12 w-auto'}
        style={dark ? { filter: 'brightness(0) invert(1)' } : undefined}
      />
    </div>
  )
}

export default BrandLogo
