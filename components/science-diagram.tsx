export function ScienceDiagram() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 500 400"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Background */}
      <rect width="500" height="400" rx="8" fill="#F9FAFB" />

      {/* Brain outline */}
      <path
        d="M250 80C180 80 140 130 140 190C140 250 180 320 250 320C320 320 360 250 360 190C360 130 320 80 250 80Z"
        stroke="#F43F5E"
        strokeWidth="3"
        fill="#FECDD3"
        fillOpacity="0.3"
      />

      {/* Brain details */}
      <path d="M200 120C180 140 170 160 170 190C170 220 180 240 200 260" stroke="#F43F5E" strokeWidth="2" fill="none" />
      <path d="M300 120C320 140 330 160 330 190C330 220 320 240 300 260" stroke="#F43F5E" strokeWidth="2" fill="none" />
      <path d="M220 100C210 120 205 150 205 190C205 230 210 260 220 280" stroke="#F43F5E" strokeWidth="2" fill="none" />
      <path d="M280 100C290 120 295 150 295 190C295 230 290 260 280 280" stroke="#F43F5E" strokeWidth="2" fill="none" />
      <path d="M250 80C250 120 250 160 250 320" stroke="#F43F5E" strokeWidth="2" fill="none" />

      {/* Connection lines */}
      <line x1="250" y1="190" x2="140" y2="120" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="250" y1="190" x2="140" y2="190" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="250" y1="190" x2="140" y2="260" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="250" y1="190" x2="360" y2="120" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="250" y1="190" x2="360" y2="190" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />
      <line x1="250" y1="190" x2="360" y2="260" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />

      {/* Concept circles */}
      <circle cx="140" cy="120" r="30" fill="white" stroke="#10B981" strokeWidth="2" />
      <circle cx="140" cy="190" r="30" fill="white" stroke="#F59E0B" strokeWidth="2" />
      <circle cx="140" cy="260" r="30" fill="white" stroke="#EF4444" strokeWidth="2" />
      <circle cx="360" cy="120" r="30" fill="white" stroke="#10B981" strokeWidth="2" />
      <circle cx="360" cy="190" r="30" fill="white" stroke="#F59E0B" strokeWidth="2" />
      <circle cx="360" cy="260" r="30" fill="white" stroke="#EF4444" strokeWidth="2" />

      {/* Center circle */}
      <circle cx="250" cy="190" r="40" fill="white" stroke="#F43F5E" strokeWidth="3" />

      {/* Text labels - with improved positioning and background for better readability */}
      <g>
        <rect x="110" y="110" width="60" height="20" rx="4" fill="white" fillOpacity="0.8" />
        <text
          x="140"
          y="120"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontSize="11"
          fill="#10B981"
        >
          Empathy
        </text>
      </g>

      <g>
        <rect x="95" y="180" width="90" height="20" rx="4" fill="white" fillOpacity="0.8" />
        <text
          x="140"
          y="190"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontSize="11"
          fill="#F59E0B"
        >
          Emotional Bids
        </text>
      </g>

      <g>
        <rect x="105" y="250" width="70" height="20" rx="4" fill="white" fillOpacity="0.8" />
        <text
          x="140"
          y="260"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontSize="11"
          fill="#EF4444"
        >
          Conflict Style
        </text>
      </g>

      <g>
        <rect x="325" y="110" width="70" height="20" rx="4" fill="white" fillOpacity="0.8" />
        <text
          x="360"
          y="120"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontSize="11"
          fill="#10B981"
        >
          Attachment
        </text>
      </g>

      <g>
        <rect x="325" y="180" width="70" height="20" rx="4" fill="white" fillOpacity="0.8" />
        <text
          x="360"
          y="190"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontSize="11"
          fill="#F59E0B"
        >
          Turn Taking
        </text>
      </g>

      <g>
        <rect x="315" y="250" width="90" height="20" rx="4" fill="white" fillOpacity="0.8" />
        <text
          x="360"
          y="260"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontSize="11"
          fill="#EF4444"
        >
          Repair Attempts
        </text>
      </g>

      {/* Center text with better spacing */}
      <text
        x="250"
        y="180"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="bold"
        fill="#F43F5E"
      >
        Emotional
      </text>
      <text
        x="250"
        y="200"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="bold"
        fill="#F43F5E"
      >
        Intelligence
      </text>

      {/* Title with background for better visibility */}
      <rect x="100" y="30" width="300" height="30" rx="4" fill="white" fillOpacity="0.8" />
      <text
        x="250"
        y="45"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="#111827"
      >
        The Gottman Method
      </text>
    </svg>
  )
}
