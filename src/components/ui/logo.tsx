import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg 
          viewBox="0 0 300 80" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#ff0000",stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:"#cc0000",stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#990000",stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#ffffff",stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#e0e0e0",stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#ff4444",stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#ff0000",stopOpacity:1}} />
            </linearGradient>
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="2" dy="2" result="offset" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="300" height="80" fill="#000000" rx="8"/>
          
          <g transform="translate(15, 15)">
            <circle cx="25" cy="25" r="22" fill="url(#clockGradient)" filter="url(#dropShadow)" stroke="#ffffff" strokeWidth="1.5"/>
            <circle cx="25" cy="25" r="18" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
            <rect x="24" y="9" width="2" height="6" fill="#ff4444"/>
            <rect x="24" y="35" width="2" height="6" fill="#ff4444"/>
            <rect x="41" y="24" width="6" height="2" fill="#ff4444"/>
            <rect x="3" y="24" width="6" height="2" fill="#ff4444"/>
            <line x1="25" y1="25" x2="25" y2="17" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
            <line x1="25" y1="25" x2="33" y2="15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            <line x1="25" y1="25" x2="35" y2="25" stroke="#ff0000" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="25" cy="25" r="2" fill="#ff0000"/>
            <path d="M 35 5 L 30 20 L 38 20 L 28 35 L 33 25 L 27 25 Z" fill="url(#redGradient)" filter="url(#glow)"/>
          </g>
          
          <g transform="translate(70, 25)">
            <text x="2" y="22" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#000000" opacity="0.3">DeadLine</text>
            <text x="0" y="20" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="url(#whiteGradient)" filter="url(#dropShadow)">
              <tspan fill="url(#redGradient)">Dead</tspan><tspan fill="url(#whiteGradient)">Line</tspan>
            </text>
            <line x1="0" y1="25" x2="140" y2="25" stroke="url(#redGradient)" strokeWidth="2" opacity="0.7"/>
          </g>
          
          <circle cx="260" cy="20" r="2" fill="#ff4444" opacity="0.8"/>
          <circle cx="270" cy="30" r="1.5" fill="#ff6666" opacity="0.6"/>
          <circle cx="280" cy="25" r="1" fill="#ff8888" opacity="0.4"/>
          
          <path d="M 5 5 L 15 5 L 15 8 L 8 8 L 8 15 L 5 15 Z" fill="#ff4444" opacity="0.3"/>
          <path d="M 295 75 L 285 75 L 285 72 L 292 72 L 292 65 L 295 65 Z" fill="#ff4444" opacity="0.3"/>
          
          <circle cx="25" cy="40" r="1" fill="#ff0000" className="animate-pulse"/>
          <circle cx="260" cy="20" r="2" fill="#ff4444" className="animate-pulse"/>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold text-white ${textSizes[size]}`}>
          DeadLine
        </span>
      )}
    </Link>
  );
}
