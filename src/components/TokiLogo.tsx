import React from 'react';

interface TokiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const TokiLogo: React.FC<TokiLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const dim = {
    sm: { box: 28, text: 'text-sm' },
    md: { box: 36, text: 'text-base' },
    lg: { box: 48, text: 'text-xl' },
    xl: { box: 64, text: 'text-2xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Toki Toki Infinite Interconnected Sound Loops Logo */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-full bg-slate-950 p-1 shadow-md"
        style={{ width: dim.box, height: dim.box }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(0,242,254,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cyan chromatic aberration shadow (offset left/top) */}
          <path
            d="M 28 35 C 16 35 12 48 12 58 C 12 70 20 78 32 78 C 45 78 52 64 62 48 C 69 36 78 32 86 35 C 94 38 96 48 94 58 C 92 70 82 80 70 80 C 58 80 50 68 44 54"
            stroke="#00f2fe"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-2, -1)"
            opacity="0.9"
          />

          {/* Magenta chromatic aberration shadow (offset right/bottom) */}
          <path
            d="M 28 35 C 16 35 12 48 12 58 C 12 70 20 78 32 78 C 45 78 52 64 62 48 C 69 36 78 32 86 35 C 94 38 96 48 94 58 C 92 70 82 80 70 80 C 58 80 50 68 44 54"
            stroke="#fe2c55"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(2, 2)"
            opacity="0.9"
          />

          {/* Main White Interconnected Loop */}
          <path
            d="M 28 35 C 16 35 12 48 12 58 C 12 70 20 78 32 78 C 45 78 52 64 62 48 C 69 36 78 32 86 35 C 94 38 96 48 94 58 C 92 70 82 80 70 80 C 58 80 50 68 44 54"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Internal soundwave arcs inside left loop */}
          <path
            d="M 24 50 C 22 54 22 60 24 64"
            stroke="#fe2c55"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 19 46 C 16 52 16 62 19 68"
            stroke="#00f2fe"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Internal soundwave arcs inside right loop */}
          <path
            d="M 76 48 C 78 52 78 58 76 62"
            stroke="#00f2fe"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 81 44 C 84 50 84 60 81 66"
            stroke="#fe2c55"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight text-white ${dim.text} flex items-center`}>
            Toki Toki
          </span>
          <span className="text-[10px] text-slate-400 font-medium">टोका-टोकी</span>
        </div>
      )}
    </div>
  );
};
