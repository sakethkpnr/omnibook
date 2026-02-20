export default function GradientButton({ children, className = '', type = 'button', disabled, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn-gradient disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
