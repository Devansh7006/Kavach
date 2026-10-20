import React from 'react';

export default function SpartanShieldLogo({ 
  className = "w-9 h-9", 
  isThreat = false,
  glow = true 
}) {
  const accentColor = isThreat ? "#FF3366" : "#B2F601";
  const glowClass = isThreat 
    ? "drop-shadow-[0_0_12px_rgba(255,51,102,0.6)]" 
    : "drop-shadow-[0_0_12px_rgba(178,246,1,0.6)]";

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className} ${glow ? glowClass : ''}`}>
      <svg 
        viewBox="0 0 40 42" 
        className="w-full h-full overflow-visible select-none" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={isThreat ? "spartanBgThreat" : "spartanBgLegit"} x1="20" y1="2" x2="20" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isThreat ? "#2a0d15" : "#121a14"} />
            <stop offset="50%" stopColor="#0a0a0d" />
            <stop offset="100%" stopColor="#050507" />
          </linearGradient>
          <filter id={isThreat ? "spartanGlowThreat" : "spartanGlowLegit"} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={accentColor} floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Outer Spartan Shield Contour */}
        <path 
          d="M20 2.5L36 7.5V19.5C36 29.5 29 37 20 39.5C11 37 4 29.5 4 19.5V7.5L20 2.5Z" 
          fill={`url(#${isThreat ? "spartanBgThreat" : "spartanBgLegit"})`} 
          stroke={accentColor} 
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* 2. Inner Shield Cyber Inset Ring */}
        <path 
          d="M20 5.5L33 9.5V19C33 27.2 27.2 33.8 20 36.2C12.8 33.8 7 27.2 7 19V9.5L20 5.5Z" 
          stroke={accentColor} 
          strokeWidth="0.7"
          strokeOpacity="0.35"
          strokeDasharray="2 2"
        />

        {/* 3. Spartan Plumed Crest */}
        <path 
          d="M18.2 6.5C18.2 6.5 20 4.8 21.8 6.5C21.8 8.5 21 11 20 12C19 11 18.2 8.5 18.2 6.5Z" 
          fill={accentColor} 
        />
        <line x1="20" y1="4.5" x2="20" y2="11.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />

        {/* 4. Corinthian Helmet Dome */}
        <path 
          d="M13.5 14C13.5 14 16.5 12 20 12C23.5 12 26.5 14 26.5 14V22.5C26.5 26.2 23.2 28.5 20 29.5C16.8 28.5 13.5 26.2 13.5 22.5V14Z" 
          fill="#0c0e14" 
          stroke={accentColor} 
          strokeWidth="1.3"
        />

        {/* 5. Spartan Visor T-Slit (Iconic Corinthian Eye & Nose Guard) */}
        {/* Horizontal Eye Slit */}
        <path 
          d="M15 17.5H25V19H15V17.5Z" 
          fill={accentColor} 
        />
        {/* Vertical Nose Guard Bar */}
        <path 
          d="M19.2 17.5H20.8V25H19.2V17.5Z" 
          fill={accentColor} 
        />

        {/* 6. Angular Cheek Guards */}
        <polygon 
          points="14.5,20.5 16,24.5 17.5,23.5 16.5,19.5" 
          fill={accentColor} 
          opacity="0.85" 
        />
        <polygon 
          points="25.5,20.5 24,24.5 22.5,23.5 23.5,19.5" 
          fill={accentColor} 
          opacity="0.85" 
        />

        {/* 7. Bottom Apex Accent */}
        <circle cx="20" cy="33.5" r="1.2" fill={accentColor} />
      </svg>
    </div>
  );
}
