import React from 'react';

export interface ArEffect {
  id: string;
  name: string;
  category: 'trending' | 'face' | 'fun' | 'beauty' | 'atmosphere';
  icon: string;
  cssFilter?: string;
  renderOverlay?: () => React.ReactNode;
}

interface ArEffectsOverlayProps {
  effectId: string;
}

export const AR_EFFECTS_LIST: ArEffect[] = [
  {
    id: 'none',
    name: 'सामान्य (Normal)',
    category: 'trending',
    icon: '🚫',
    cssFilter: 'none',
  },
  {
    id: 'bunny_ears',
    name: 'बनी इयर्स (Bunny Ears)',
    category: 'face',
    icon: '🐰',
    cssFilter: 'contrast(105%) brightness(105%)',
  },
  {
    id: 'neon_hearts',
    name: 'फ्लोटिंग हार्ट्स (Hearts)',
    category: 'face',
    icon: '💖',
    cssFilter: 'saturate(130%)',
  },
  {
    id: 'cat_whiskers',
    name: 'क्यूट कैट (Cat & Fish)',
    category: 'face',
    icon: '🐱',
    cssFilter: 'contrast(110%)',
  },
  {
    id: 'neon_glasses',
    name: 'नियॉन शेड्स (Cyber)',
    category: 'fun',
    icon: '🕶️',
    cssFilter: 'hue-rotate(20deg) saturate(140%)',
  },
  {
    id: 'sparkle_dust',
    name: 'गोल्डन स्पार्कल (Glitter)',
    category: 'beauty',
    icon: '✨',
    cssFilter: 'brightness(110%) contrast(108%)',
  },
  {
    id: 'retro_vhs',
    name: 'रेट्रो वीएचएस (VHS 90s)',
    category: 'atmosphere',
    icon: '📼',
    cssFilter: 'sepia(35%) contrast(120%) saturate(120%)',
  },
];

export const ArEffectsOverlay: React.FC<ArEffectsOverlayProps> = ({ effectId }) => {
  if (effectId === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-between overflow-hidden">
      {/* Bunny Ears Effect */}
      {effectId === 'bunny_ears' && (
        <div className="w-full flex justify-center pt-8 animate-bounce duration-1000">
          <svg viewBox="0 0 200 120" className="w-48 sm:w-56 h-auto drop-shadow-[0_10px_20px_rgba(254,44,85,0.4)]">
            {/* Left Ear */}
            <path
              d="M 60 110 C 30 70 30 20 60 10 C 75 10 75 60 65 110 Z"
              fill="#ffffff"
              stroke="#f43f5e"
              strokeWidth="4"
            />
            <path
              d="M 58 95 C 40 65 42 28 60 20 C 68 20 68 55 62 95 Z"
              fill="#fda4af"
            />
            {/* Right Ear */}
            <path
              d="M 140 110 C 170 70 170 20 140 10 C 125 10 125 60 135 110 Z"
              fill="#ffffff"
              stroke="#f43f5e"
              strokeWidth="4"
            />
            <path
              d="M 142 95 C 160 65 158 28 140 20 C 132 20 132 55 138 95 Z"
              fill="#fda4af"
            />
            {/* Cute Bow */}
            <circle cx="100" cy="105" r="7" fill="#f43f5e" />
            <path d="M 85 105 C 75 95 75 115 85 105 Z" fill="#fda4af" />
            <path d="M 115 105 C 125 95 125 115 115 105 Z" fill="#fda4af" />
          </svg>
        </div>
      )}

      {/* Floating Neon Hearts Halo */}
      {effectId === 'neon_hearts' && (
        <div className="w-full flex justify-center pt-10">
          <div className="relative w-64 h-24 flex items-center justify-center">
            <span className="absolute -left-2 top-2 text-3xl animate-ping duration-1000">💖</span>
            <span className="absolute left-10 -top-4 text-4xl animate-bounce">💕</span>
            <span className="text-5xl animate-pulse">💓</span>
            <span className="absolute right-10 -top-4 text-4xl animate-bounce [animation-delay:0.3s]">💕</span>
            <span className="absolute -right-2 top-2 text-3xl animate-ping [animation-delay:0.6s]">💖</span>
          </div>
        </div>
      )}

      {/* Cat Whiskers & Nose */}
      {effectId === 'cat_whiskers' && (
        <div className="w-full h-full flex flex-col items-center justify-center -mt-6">
          <svg viewBox="0 0 200 120" className="w-64 h-auto drop-shadow-md">
            {/* Cute Cat Nose */}
            <polygon points="90,45 110,45 100,56" fill="#f43f5e" />
            {/* Mouth */}
            <path d="M 94 56 Q 90 64 80 62" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
            <path d="M 106 56 Q 110 64 120 62" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
            {/* Left Whiskers */}
            <line x1="30" y1="42" x2="80" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="25" y1="55" x2="78" y2="55" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="68" x2="80" y2="62" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            {/* Right Whiskers */}
            <line x1="170" y1="42" x2="120" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="175" y1="55" x2="122" y2="55" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="170" y1="68" x2="120" y2="62" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            {/* Blushing Cheeks */}
            <ellipse cx="65" cy="58" rx="14" ry="7" fill="#fda4af" opacity="0.6" />
            <ellipse cx="135" cy="58" rx="14" ry="7" fill="#fda4af" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* Cyberpunk Neon Sunglasses */}
      {effectId === 'neon_glasses' && (
        <div className="w-full h-full flex flex-col items-center justify-center -mt-16">
          <svg viewBox="0 0 240 80" className="w-64 sm:w-72 h-auto drop-shadow-[0_0_15px_rgba(0,242,254,0.8)] animate-pulse">
            <polygon points="20,15 110,15 100,55 35,55" fill="rgba(0,242,254,0.3)" stroke="#00f2fe" strokeWidth="4" />
            <polygon points="130,15 220,15 205,55 140,55" fill="rgba(254,44,85,0.3)" stroke="#fe2c55" strokeWidth="4" />
            {/* Bridge */}
            <line x1="110" y1="20" x2="130" y2="20" stroke="#ffffff" strokeWidth="4" />
            {/* Highlights */}
            <line x1="30" y1="25" x2="60" y2="25" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
            <line x1="145" y1="25" x2="175" y2="25" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
          </svg>
        </div>
      )}

      {/* Sparkle Glitter Dust */}
      {effectId === 'sparkle_dust' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-2xl text-amber-300 animate-ping">✨</div>
          <div className="absolute top-1/3 right-1/4 text-3xl text-amber-200 animate-bounce [animation-delay:0.5s]">⭐</div>
          <div className="absolute bottom-1/3 left-1/3 text-2xl text-yellow-300 animate-pulse [animation-delay:0.8s]">✨</div>
          <div className="absolute top-1/2 right-1/3 text-3xl text-amber-100 animate-ping [animation-delay:1.2s]">🌟</div>
          <div className="absolute bottom-1/4 right-1/4 text-xl text-yellow-200 animate-bounce [animation-delay:0.2s]">✨</div>
        </div>
      )}

      {/* Retro VHS 90s Camera Overlay */}
      {effectId === 'retro_vhs' && (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-emerald-400 text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>REC ● [TOKI-VHS]</span>
            </span>
            <span>SP 0:00:14</span>
          </div>

          <div className="w-full flex justify-between items-end">
            <div>
              <p>OCT 04, 2026</p>
              <p>PM 03:31:04</p>
            </div>
            <div className="tracking-widest">AUTO TRACKING</div>
          </div>
        </div>
      )}
    </div>
  );
};
