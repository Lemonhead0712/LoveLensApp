export function EmotionalIntelligenceDiagram() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Main circle background */}
      <circle cx="250" cy="250" r="200" fill="#111111" />

      {/* Gradient circles for each quadrant */}
      {/* Top - Perceiving */}
      <path
        d="M250 50C180 50 120 110 120 180C120 250 180 250 250 250C320 250 380 250 380 180C380 110 320 50 250 50Z"
        fill="url(#perceivingGradient)"
      />

      {/* Right - Managing */}
      <path
        d="M450 250C450 180 390 120 320 120C250 120 250 180 250 250C250 320 250 380 320 380C390 380 450 320 450 250Z"
        fill="url(#managingGradient)"
      />

      {/* Bottom - Understanding */}
      <path
        d="M250 450C320 450 380 390 380 320C380 250 320 250 250 250C180 250 120 250 120 320C120 390 180 450 250 450Z"
        fill="url(#understandingGradient)"
      />

      {/* Left - Using */}
      <path
        d="M50 250C50 320 110 380 180 380C250 380 250 320 250 250C250 180 250 120 180 120C110 120 50 180 50 250Z"
        fill="url(#usingGradient)"
      />

      {/* Center circle */}
      <circle cx="250" cy="250" r="80" fill="#111111" stroke="#333333" strokeWidth="2" />

      {/* Center text */}
      <text
        x="250"
        y="240"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="white"
      >
        Emotional
      </text>
      <text
        x="250"
        y="270"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="white"
      >
        Intelligence
      </text>

      {/* Perceiving Emotions */}
      <text
        x="250"
        y="100"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#FF4D4D"
      >
        Perceiving
      </text>
      <text
        x="250"
        y="120"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#FF4D4D"
      >
        Emotions
      </text>

      {/* Managing Emotions */}
      <text
        x="380"
        y="250"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#CCCCCC"
      >
        Managing
      </text>
      <text
        x="380"
        y="270"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#CCCCCC"
      >
        Emotions
      </text>

      {/* Understanding Emotions */}
      <text
        x="250"
        y="400"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#9966FF"
      >
        Understanding
      </text>
      <text
        x="250"
        y="420"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#9966FF"
      >
        Emotions
      </text>

      {/* Using Emotions */}
      <text
        x="120"
        y="250"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#33CCFF"
      >
        Using
      </text>
      <text
        x="120"
        y="270"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#33CCFF"
      >
        Emotions
      </text>

      {/* Icons */}
      {/* Perceiving icon */}
      <circle cx="250" cy="150" r="15" fill="none" stroke="#FF4D4D" strokeWidth="2" />
      <path d="M240 150 L245 155 L260 140" stroke="#FF4D4D" strokeWidth="2" />

      {/* Managing icon */}
      <circle cx="350" cy="250" r="15" fill="none" stroke="#CCCCCC" strokeWidth="2" />
      <path d="M345 245 L350 250 L355 245 M350 245 L350 255" stroke="#CCCCCC" strokeWidth="2" />

      {/* Understanding icon */}
      <circle cx="250" cy="350" r="15" fill="none" stroke="#9966FF" strokeWidth="2" />
      <path d="M245 350 L250 355 L255 350 M250 345 L250 355" stroke="#9966FF" strokeWidth="2" />

      {/* Using icon */}
      <circle cx="150" cy="250" r="15" fill="none" stroke="#33CCFF" strokeWidth="2" />
      <path d="M145 250 L155 250 M150 245 L150 255" stroke="#33CCFF" strokeWidth="2" />

      {/* Emotion faces in the left section */}
      <circle cx="120" cy="200" r="10" fill="none" stroke="#33CCFF" strokeWidth="1" />
      <path
        d="M115 195 L115 195 M125 195 L125 195 M115 205 C115 208 125 208 125 205"
        stroke="#33CCFF"
        strokeWidth="1"
      />

      <circle cx="150" cy="200" r="10" fill="none" stroke="#33CCFF" strokeWidth="1" />
      <path
        d="M145 195 L145 195 M155 195 L155 195 M145 205 C145 202 155 202 155 205"
        stroke="#33CCFF"
        strokeWidth="1"
      />

      {/* Light bulb icon in the right section */}
      <path
        d="M380 200 C380 190 370 180 360 180 C350 180 340 190 340 200 C340 205 345 210 350 215 L350 225 L370 225 L370 215 C375 210 380 205 380 200 Z"
        fill="none"
        stroke="#CCCCCC"
        strokeWidth="1"
      />
      <path d="M350 225 L350 235 L370 235 L370 225" fill="none" stroke="#CCCCCC" strokeWidth="1" />
      <path d="M355 215 L365 215" fill="none" stroke="#CCCCCC" strokeWidth="1" />
      <path d="M355 220 L365 220" fill="none" stroke="#CCCCCC" strokeWidth="1" />

      {/* Gradients */}
      <defs>
        <linearGradient id="perceivingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="100%" stopColor="#FF9933" />
        </linearGradient>

        <linearGradient id="managingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#CCCCCC" />
        </linearGradient>

        <linearGradient id="understandingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9966FF" />
          <stop offset="100%" stopColor="#CCCCCC" />
        </linearGradient>

        <linearGradient id="usingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#33CCFF" />
          <stop offset="100%" stopColor="#9966FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
