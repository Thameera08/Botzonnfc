function Card({ className = '', children }) {
  return <div className={`modern-panel rounded-2xl ${className}`}>{children}</div>
}

export default Card
