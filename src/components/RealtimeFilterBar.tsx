import React from 'react';
import { Sparkles } from 'lucide-react';

export type VideoFilterType = 'normal' | 'black-and-white' | 'sepia' | 'vibrant';

export interface VideoFilter {
  id: VideoFilterType;
  label: string;
  enLabel: string;
  css: string;
  swatchGradient: string;
  description: string;
}

export const VIDEO_FILTERS: VideoFilter[] = [
  {
    id: 'normal',
    label: 'ओरिजिनल',
    enLabel: 'Normal',
    css: 'none',
    swatchGradient: 'from-slate-400 to-slate-200',
    description: 'बिना किसी फ़िल्टर के नेचुरल वीडियो',
  },
  {
    id: 'black-and-white',
    label: 'ब्लैक & व्हाइट',
    enLabel: 'B&W',
    css: 'grayscale(100%) contrast(125%)',
    swatchGradient: 'from-black via-gray-500 to-white',
    description: 'क्लासिक मोनोक्रोम और डीप कंट्रास्ट',
  },
  {
    id: 'sepia',
    label: 'सेपिया',
    enLabel: 'Sepia',
    css: 'sepia(100%) contrast(115%) saturate(110%)',
    swatchGradient: 'from-amber-900 via-amber-600 to-amber-200',
    description: 'विंटेज रेट्रो 70s वॉर्म टोन',
  },
  {
    id: 'vibrant',
    label: 'वाइब्रेंट',
    enLabel: 'Vibrant',
    css: 'saturate(210%) contrast(125%) brightness(108%)',
    swatchGradient: 'from-rose-500 via-amber-400 to-cyan-400',
    description: 'हाई सैचुरेशन और चमकदार पॉप रंग',
  },
];

interface RealtimeFilterBarProps {
  currentFilter: VideoFilterType;
  onSelectFilter: (filter: VideoFilterType) => void;
  isRecording?: boolean;
  className?: string;
}

export const RealtimeFilterBar: React.FC<RealtimeFilterBarProps> = ({
  currentFilter,
  onSelectFilter,
  isRecording = false,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl transition-all ${className} ${
        isRecording ? 'ring-2 ring-rose-500/70 shadow-[0_0_15px_rgba(254,44,85,0.4)]' : ''
      }`}
    >
      {/* Icon Indicator */}
      <div className="pl-1.5 pr-0.5 flex items-center gap-1 text-slate-300">
        <Sparkles className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-400 animate-spin-slow' : 'text-amber-400'}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline text-white/90">
          फ़िल्टर
        </span>
      </div>

      {/* Filter Switcher Buttons */}
      <div className="flex items-center gap-1">
        {VIDEO_FILTERS.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFilter(f.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'bg-white text-slate-950 shadow-md font-bold ring-2 ring-rose-500/50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={f.description}
            >
              {/* Mini Color Swatch Ring */}
              <span
                className={`w-3 h-3 rounded-full bg-gradient-to-tr ${f.swatchGradient} border border-white/40 shrink-0 ${
                  isActive ? 'scale-110 shadow-sm' : ''
                }`}
              />
              <span className="text-[11px] whitespace-nowrap">{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
