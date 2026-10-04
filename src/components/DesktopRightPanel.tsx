import React from 'react';
import { Keyboard, Music, Plus, Sparkles, Volume2, Heart } from 'lucide-react';
import { VideoItem } from '../types';
import { Language, t } from '../utils/translations';

interface DesktopRightPanelProps {
  currentVideo: VideoItem;
  onOpenCreateWithSound: (soundTitle: string) => void;
  lang: Language;
}

export const DesktopRightPanel: React.FC<DesktopRightPanelProps> = ({
  currentVideo,
  onOpenCreateWithSound,
  lang,
}) => {
  const tr = t[lang];

  return (
    <div className="hidden xl:flex flex-col w-80 shrink-0 border-l border-slate-800/80 p-5 space-y-6 overflow-y-auto no-scrollbar h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
      {/* Sound Spotlight Card */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Music className="w-4 h-4" />
          <span>वर्तमान संगीत ट्रैक</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Music className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{currentVideo.sound.title}</p>
            <p className="text-xs text-slate-400 truncate">{currentVideo.sound.artist}</p>
            <span className="text-[10px] text-cyan-400 font-semibold">{currentVideo.sound.bpm} BPM · {currentVideo.sound.genre}</span>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateWithSound(currentVideo.sound.title)}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700/60"
        >
          <Plus className="w-3.5 h-3.5 text-rose-400" />
          <span>{tr.useSound}</span>
        </button>
      </div>

      {/* Keyboard Navigation Shortcuts */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
          <Keyboard className="w-4 h-4 text-cyan-400" />
          <span>कीबोर्ड शॉर्टकट्स</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 text-slate-300">
            <span>अगला / पिछला वीडियो</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">
                ↓
              </kbd>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">
                ↑
              </kbd>
            </div>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-300">
            <span>चलाएं / रोकें (Play/Pause)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">
              Space
            </kbd>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-300">
            <span>लाइक करें (Like)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">
              L
            </kbd>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-300">
            <span>म्यूट / अनम्यूट (Mute)</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">
              M
            </kbd>
          </div>
        </div>
      </div>

      {/* TokiToki Community Highlight */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-900/30 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>#TokiToki क्रिएटर प्रोग्राम</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          छोटे वीडियो बनाएं और टोकन्स व लाखों प्रशंसकों का प्यार पाएं! आज ही अपना पहला वीडियो रिकॉर्ड करें।
        </p>
      </div>
    </div>
  );
};
