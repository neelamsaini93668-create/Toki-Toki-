import React, { useState, useMemo } from 'react';
import { Search, Flame, Music, Play, Heart, Hash } from 'lucide-react';
import { VideoItem, SoundTrack } from '../types';
import { TRENDING_SOUNDS } from '../data/mockData';
import { Language, t } from '../utils/translations';
import { audioEngine } from '../utils/audioEngine';

interface ExploreViewProps {
  videos: VideoItem[];
  onSelectVideo: (videoId: string) => void;
  lang: Language;
}

const CATEGORIES = ['all', 'dance', 'comedy', 'food', 'tech', 'music', 'vlog', 'fitness'] as const;

export const ExploreView: React.FC<ExploreViewProps> = ({
  videos,
  onSelectVideo,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const tr = t[lang];

  // Filtered videos based on search and category
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesCategory;

      const matchesSearch =
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term) ||
        v.author.name.toLowerCase().includes(term) ||
        v.author.handle.toLowerCase().includes(term) ||
        v.tags.some((t) => t.toLowerCase().includes(term)) ||
        v.sound.title.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [videos, searchTerm, selectedCategory]);

  const handleToggleSoundPreview = (sound: SoundTrack) => {
    if (playingSoundId === sound.id) {
      audioEngine.stopSound();
      setPlayingSoundId(null);
    } else {
      audioEngine.playSound(sound.type, sound.bpm);
      setPlayingSoundId(sound.id);
    }
  };

  const trendingHashtags = [
    { tag: 'TokiToki', count: '1.4M पोस्ट', views: '450M' },
    { tag: 'DesiBhangra', count: '890K पोस्ट', views: '280M' },
    { tag: 'DelhiMomos', count: '640K पोस्ट', views: '190M' },
    { tag: 'ComedyShorts', count: '1.1M पोस्ट', views: '320M' },
    { tag: 'SmartphoneTricks', count: '410K पोस्ट', views: '110M' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={tr.searchPlaceholder}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-lg shadow-black/40 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            साफ़ करें
          </button>
        )}
      </div>

      {/* Category Pills (Functional buttons with clean segmented state) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat === 'all' ? tr.allCategories : tr[cat as keyof typeof tr] || cat}
          </button>
        ))}
      </div>

      {/* Trending Hashtags Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Flame className="w-5 h-5 text-rose-500" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {tr.trendingHashtags}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {trendingHashtags.map((h) => (
            <button
              key={h.tag}
              onClick={() => setSearchTerm(h.tag)}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-rose-400 group-hover:text-rose-300 font-bold text-xs sm:text-sm truncate">
                <Hash className="w-4 h-4 shrink-0" />
                <span>{h.tag}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{h.count}</p>
              <p className="text-[10px] text-slate-500">{h.views} व्यूज</p>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Audio Tracks Carousel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Music className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {tr.popularSounds}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TRENDING_SOUNDS.map((snd) => (
            <div
              key={snd.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleSoundPreview(snd)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
                    playingSoundId === snd.id
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  aria-label="Play sound preview"
                >
                  {playingSoundId === snd.id ? (
                    <span className="w-3 h-3 bg-white rounded-xs" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">{snd.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{snd.artist}</p>
                </div>
              </div>
              <button
                onClick={() => setSearchTerm(snd.title)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                वीडियो देखें
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Video Grid Feed */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
          {selectedCategory === 'all' ? 'लोकप्रिय वीडियो' : `${tr[selectedCategory as keyof typeof tr] || selectedCategory} वीडियो`} ({filteredVideos.length})
        </h2>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm font-medium">कोई वीडियो नहीं मिला। कृपया दूसरा शब्द खोजें।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => onSelectVideo(vid.id)}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group shadow-lg"
              >
                {/* Background poster/gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${vid.gradient} opacity-80 group-hover:scale-105 transition-transform duration-300`} />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Creator Avatar & Handle (Top) */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  <img
                    src={vid.author.avatar}
                    alt={vid.author.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                  <span className="text-[10px] font-semibold text-white/90 truncate drop-shadow">
                    {vid.author.handle}
                  </span>
                </div>

                {/* Center Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-12 h-12 rounded-full bg-slate-950/70 text-white flex items-center justify-center backdrop-blur-sm shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 space-y-1">
                  <p className="text-xs font-semibold text-white line-clamp-2 drop-shadow leading-snug">
                    {vid.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current text-slate-400" />
                      <span className="tabular-nums font-medium">{vid.views.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-current text-rose-500" />
                      <span className="tabular-nums font-medium">{vid.likesCount.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
