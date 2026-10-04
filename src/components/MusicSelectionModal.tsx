import React, { useState, useEffect } from 'react';
import {
  Music,
  Search,
  Play,
  Pause,
  Check,
  X,
  Volume2,
  Sparkles,
  Flame,
  Radio,
  Sliders,
} from 'lucide-react';
import { SoundTrack } from '../types';
import { TRENDING_SOUNDS } from '../data/mockData';
import { audioEngine } from '../utils/audioEngine';

interface MusicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSound: SoundTrack;
  onSelectSound: (sound: SoundTrack, volume?: number) => void;
  lang?: 'hi' | 'en';
}

type SoundCategory = 'all' | 'trending' | 'dhol' | 'lofi' | 'edm' | 'hiphop' | 'acoustic';

export const MusicSelectionModal: React.FC<MusicSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedSound,
  onSelectSound,
  lang = 'hi',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SoundCategory>('all');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [tempSelectedSound, setTempSelectedSound] = useState<SoundTrack>(selectedSound);
  const [musicVolume, setMusicVolume] = useState<number>(85);
  const [originalAudioVolume, setOriginalAudioVolume] = useState<number>(100);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setTempSelectedSound(selectedSound);
    } else {
      // Stop preview audio when closed
      if (playingTrackId) {
        audioEngine.stopSound();
        setPlayingTrackId(null);
      }
    }
  }, [isOpen, selectedSound]);

  // Clean up audio preview when component unmounts
  useEffect(() => {
    return () => {
      audioEngine.stopSound();
    };
  }, []);

  if (!isOpen) return null;

  // Toggle live preview of track using Web Audio synthesizer
  const togglePreview = (track: SoundTrack) => {
    if (playingTrackId === track.id) {
      audioEngine.stopSound();
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(track.id);
      audioEngine.playSound(track.type, track.bpm);
    }
  };

  // Filter sounds based on search and category
  const filteredSounds = TRENDING_SOUNDS.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;
    if (activeCategory === 'trending') return true; // all curated list are trending
    if (activeCategory === 'dhol') return track.type === 'dhol';
    if (activeCategory === 'lofi') return track.type === 'lofi';
    if (activeCategory === 'edm') return track.type === 'edm' || track.type === 'pop';
    if (activeCategory === 'hiphop') return track.type === 'hiphop';
    if (activeCategory === 'acoustic') return track.type === 'acoustic';
    return true;
  });

  const handleApply = () => {
    audioEngine.stopSound();
    setPlayingTrackId(null);
    onSelectSound(tempSelectedSound, musicVolume / 100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* TOP HEADER */}
        <div className="space-y-3 pb-2 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#fe2c55] via-purple-600 to-[#00f2fe] p-0.5 flex items-center justify-center shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                  <Music className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <span>संगीत लाइब्रेरी (Select Sound)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    ट्रेंडिंग
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  वीडियो पर बैकग्राउंड ट्रैक ओवरले करें
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                audioEngine.stopSound();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="गाना, कलाकार या शैली खोजें (Search songs)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Genre Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'सभी (All)', icon: Radio },
              { id: 'trending', label: '🔥 ट्रेंडिंग', icon: Flame },
              { id: 'dhol', label: '🥁 ढोल व भांगड़ा' },
              { id: 'lofi', label: '☕ लो-फाई' },
              { id: 'edm', label: '⚡ ईडीएम पार्टी' },
              { id: 'hiphop', label: '🎤 हिप-हॉप' },
              { id: 'acoustic', label: '🎸 एकॉस्टिक' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as SoundCategory)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* MIDDLE: TRACKS LIST */}
        <div className="flex-1 my-3 space-y-2 overflow-y-auto no-scrollbar max-h-[46vh] pr-0.5">
          {filteredSounds.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Music className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">कोई साउंड नहीं मिला। दूसरा नाम खोजें।</p>
            </div>
          ) : (
            filteredSounds.map((track) => {
              const isSelected = tempSelectedSound.id === track.id;
              const isPlaying = playingTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => setTempSelectedSound(track)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/80 shadow-md shadow-rose-500/10'
                      : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Album cover with Preview button */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 group border border-slate-800 shadow">
                    <img
                      src={track.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150'}
                      alt={track.title}
                      className={`w-full h-full object-cover transition-transform ${
                        isPlaying ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    />

                    {/* Play/Pause Preview Button Overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePreview(track);
                      }}
                      className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/60 hover:bg-[#fe2c55] text-white flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90 cursor-pointer shadow"
                      title={isPlaying ? 'रोकें' : 'सुनें (Listen)'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Center: Track details */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {track.title}
                      </h4>
                      {isPlaying && (
                        /* Audio equalizer jumping bars */
                        <div className="flex items-end gap-0.5 h-3 shrink-0">
                          <span className="w-0.5 h-3 bg-cyan-400 animate-pulse" />
                          <span className="w-0.5 h-2 bg-rose-400 animate-pulse delay-75" />
                          <span className="w-0.5 h-3.5 bg-amber-400 animate-pulse delay-150" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {track.artist}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500 font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {track.genre}
                      </span>
                      <span>·</span>
                      <span>{track.duration}s</span>
                      <span>·</span>
                      <span className="text-cyan-400">{track.useCount || '500K Reels'}</span>
                    </div>
                  </div>

                  {/* Right: Select indicator */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-[#fe2c55] text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border border-slate-700 bg-slate-800/60 hover:border-slate-500" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM CONTROLS: Volume mixing & Apply Button */}
        <div className="space-y-3 pt-3 border-t border-slate-800 bg-slate-950">
          {/* Overlay Volume Mixer Drawer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>बैकग्राउंड म्यूजिक वॉल्यूम:</span>
              </span>
              <span className="font-mono text-cyan-300">{musicVolume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f2fe]"
            />
          </div>

          {/* Currently selected track preview pill */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Music className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-bounce" />
              <span className="text-slate-300 truncate">
                चयनित: <strong className="text-white">{tempSelectedSound.title}</strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {tempSelectedSound.bpm} BPM
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                audioEngine.stopSound();
                onClose();
              }}
              className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              रद्द करें
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#fe2c55] via-pink-500 to-[#00f2fe] text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>साउंड जोड़ें (Apply Track)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
