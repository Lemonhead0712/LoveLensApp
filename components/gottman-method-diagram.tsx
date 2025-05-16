export function GottmanMethodDiagram() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Background */}
      <rect width="500" height="400" fill="#111111" rx="8" />

      {/* House Structure */}
      {/* Roof */}
      <path d="M250 50 L100 150 L400 150 Z" fill="#FF6B8A" />
      <rect x="220" y="120" width="60" height="30" rx="4" fill="#111111" />
      <text
        x="250"
        y="140"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fontWeight="bold"
        fill="white"
      >
        Sound Relationship
      </text>

      {/* Top Floor */}
      <rect x="120" y="150" width="260" height="70" fill="#FF8FA3" />
      <text
        x="250"
        y="185"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="white"
      >
        Trust and Commitment
      </text>

      {/* Middle Floor */}
      <rect x="120" y="220" width="260" height="70" fill="#FFA3B5" />
      <text
        x="250"
        y="255"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="white"
      >
        Managing Conflict
      </text>

      {/* Foundation */}
      <rect x="100" y="290" width="300" height="70" fill="#FFB8C6" />
      <text
        x="250"
        y="325"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="white"
      >
        Shared Meaning
      </text>

      {/* Four Horsemen */}
      <circle cx="150" cy="240" r="15" fill="#111111" stroke="#FF4D4D" strokeWidth="2" />
      <text
        x="150"
        y="240"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#FF4D4D"
      >
        4H
      </text>

      {/* Repair Attempts */}
      <circle cx="350" cy="240" r="15" fill="#111111" stroke="#33CCFF" strokeWidth="2" />
      <text
        x="350"
        y="240"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#33CCFF"
      >
        RA
      </text>

      {/* Emotional Bids */}
      <circle cx="200" cy="170" r="15" fill="#111111" stroke="#FFCC33" strokeWidth="2" />
      <text
        x="200"
        y="170"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#FFCC33"
      >
        EB
      </text>

      {/* Shared Goals */}
      <circle cx="300" cy="170" r="15" fill="#111111" stroke="#99FF66" strokeWidth="2" />
      <text
        x="300"
        y="170"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#99FF66"
      >
        SG
      </text>

      {/* Legend */}
      <text
        x="130"
        y="370"
        textAnchor="start"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill="white"
      >
        4H: Four Horsemen
      </text>
      <text
        x="250"
        y="370"
        textAnchor="start"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill="white"
      >
        RA: Repair Attempts
      </text>
      <text
        x="130"
        y="385"
        textAnchor="start"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill="white"
      >
        EB: Emotional Bids
      </text>
      <text
        x="250"
        y="385"
        textAnchor="start"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fill="white"
      >
        SG: Shared Goals
      </text>
    </svg>
  )
}
