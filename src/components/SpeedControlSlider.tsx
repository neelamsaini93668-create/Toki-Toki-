import React from 'react';
import { Zap, Gauge } from 'lucide-react';

interface SpeedControlSliderProps {
  speed: number;
  onChangeSpeed: (speed: number) => void;
  className?: string;
  compact?: boolean;
}

export const SPEED_OPTIONS = [0.5, 1, 2] as const;

export const SpeedControlSlider: React.FC<SpeedControlSliderProps> = ({
  speed,
  onChangeSpeed,
  className = '',
  compact = false,
}) => {
  // Map speed to slider index: 0 -> 0.5, 1 -> 1, 2 -> 2
  const currentIndex = SPEED_OPTIONS.indexOf(speed as (typeof SPEED_OPTIONS)[number]);
  const safeIndex = currentIndex >= 0 ? currentIndex : 1;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    const selected = SPEED_OPTIONS[idx] ?? 1;
    onChangeSpeed(selected);
  };

  const getSpeedLabel = (s: number) => {
    if (s === 0.5) return 'स्लो (0.5x)';
    if (s === 2) return 'फास्ट (2x)';
    return 'सामान्य (1x)';
  };

  return (
    <div
      className={`bg-slate-950/90 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-xl select-none ${className}`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>प्लेबैक स्पीड (Playback Speed)</span>
        </div>
        <span
          className={`text-[11px] font-black px-2 py-0.5 rounded-full border shadow-sm ${
            speed === 0.5
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : speed === 2
              ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
              : 'bg-white/10 text-white border-white/20'
          }`}
        >
          {speed}x · {getSpeedLabel(speed)}
        </span>
      </div>

      {/* Speed Slider Track with Stepper Controls */}
      <div className="relative px-2 py-1">
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={safeIndex}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#fe2c55] focus:outline-none transition-all"
        />

        {/* Discrete Step Marks / Buttons */}
        <div className="flex justify-between items-center mt-2 px-0.5">
          {SPEED_OPTIONS.map((val, idx) => {
            const isSelected = speed === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChangeSpeed(val)}
                className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'text-white scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mb-0.5 transition-all ${
                    isSelected
                      ? 'bg-[#fe2c55] ring-4 ring-rose-500/40 scale-125'
                      : 'bg-slate-600'
                  }`}
                />
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-white text-slate-950 shadow-md font-extrabold'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {val}x
                </span>
                {!compact && (
                  <span className="text-[9px] font-medium text-slate-400">
                    {val === 0.5 ? 'Slow-Mo' : val === 1 ? 'Normal' : 'Fast 2x'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
