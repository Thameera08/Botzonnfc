import connectMeLogo from '../../assets/Logo png-01.png'

function BrandLogo2({ className = '', compact = false, dark = false, imageClassName = '' }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={connectMeLogo}
        alt="ConnectMe"
        className={`${compact ? 'h-9 w-auto' : 'h-12 w-auto'} ${imageClassName}`}
        style={dark ? { filter: 'brightness(0) invert(1)' } : undefined}
      />
    </div>
  )
}

export default BrandLogo2
