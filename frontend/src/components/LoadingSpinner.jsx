export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`animate-spin w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full ${className}`} />
  )
}
