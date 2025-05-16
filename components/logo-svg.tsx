export function LogoSVG({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle with padding */}
      <circle cx="50" cy="50" r="45" fill="#f5f5f5" />

      {/* Camera body */}
      <rect x="20" y="30" width="60" height="45" rx="5" fill="#7c3aed" />

      {/* Camera lens */}
      <circle cx="50" cy="52" r="18" fill="#f3f4f6" stroke="#7c3aed" strokeWidth="2" />

      {/* Heart in lens */}
      <path
        d="M50 60 L43 53 C40 50 40 45 43 42 C46 39 51 39 54 42 L50 46 L46 42 C49 39 54 39 57 42 C60 45 60 50 57 53 L50 60Z"
        fill="#ec4899"
      />

      {/* Camera flash */}
      <rect x="65" y="35" width="10" height="5" rx="2" fill="#f3f4f6" />

      {/* Camera button */}
      <circle cx="75" cy="45" r="3" fill="#f3f4f6" />
    </svg>
  )
}
