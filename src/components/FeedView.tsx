import React, { useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Sparkles,
  Radio,
  Search,
  Layers,
} from 'lucide-react';
import { VideoItem, Creator } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { VideoOverlay } from './VideoOverlay';
import { Language, t } from '../utils/translations';

interface FeedViewProps {
  videos: VideoItem[];
  currentIndex: number;
  onChangeIndex: (newIndex: number) => void;
  feedMode: 'foryou' | 'following';
  onChangeFeedMode: (mode: 'foryou' | 'following') => void;
  onOpenSearch: () => void;
  onOpenDuet: (video: VideoItem) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onLikeVideo: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onOpenComments: (videoId: string) => void;
  onOpenShare: (video: VideoItem) => void;
  onFollowAuthor: (authorId: string) => void;
  onSelectTag: (tag: string) => void;
  onViewProfile: (author: Creator) => void;
  lang: Language;
}

export const FeedView: React.FC<FeedViewProps> = ({
  videos,
  currentIndex,
  onChangeIndex,
  feedMode,
  onChangeFeedMode,
  onOpenSearch,
  onOpenDuet,
  isMuted,
  onToggleMute,
  onLikeVideo,
  onToggleBookmark,
  onOpenComments,
  onOpenShare,
  onFollowAuthor,
  onSelectTag,
  onViewProfile,
  lang,
}) => {
  const currentVideo = videos[currentIndex] || videos[0];
  const tr = t[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Keyboard navigation for feeds (Up/Down, Space, L, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < videos.length - 1) {
          onChangeIndex(currentIndex + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          onChangeIndex(currentIndex - 1);
        }
      } else if (e.key === 'l' || e.key === 'L') {
        onLikeVideo(currentVideo.id);
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, currentVideo?.id, onChangeIndex, onLikeVideo, onToggleMute]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < videos.length - 1) {
        onChangeIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        onChangeIndex(currentIndex - 1);
      }
    }
  };

  // Wheel handling for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 40) {
      if (e.deltaY > 0 && currentIndex < videos.length - 1) {
        onChangeIndex(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        onChangeIndex(currentIndex - 1);
      }
    }
  };

  if (!currentVideo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
        <Sparkles className="w-12 h-12 text-rose-500 mb-3" />
        <p className="text-base font-semibold text-white">फ़ीड में कोई वीडियो नहीं है</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex-1 relative flex items-center justify-center h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] p-0 sm:p-4 select-none overflow-hidden"
    >
      {/* Video Container Frame matching TikTok UI (Screenshot 1) */}
      <div className="relative w-full h-full max-w-[440px] max-h-[840px] sm:rounded-3xl overflow-hidden shadow-2xl bg-black border sm:border-slate-800 flex items-center justify-center">
        {/* IN-FEED TOP BAR (Screenshot 1: Live Icon | Following / For You | Search Icon) */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-3 px-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/60 to-transparent">
          {/* Live Icon (Left) */}
          <button
            onClick={() => alert('लाइव ब्रॉडकास्ट जल्द आ रहा है!')}
            className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="लाइव देखें"
          >
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">LIVE</span>
          </button>

          {/* Following | For You Tab Switcher (Center) */}
          <div className="flex items-center gap-4 text-sm font-bold">
            <button
              onClick={() => onChangeFeedMode('following')}
              className={`transition-all cursor-pointer relative py-1 ${
                feedMode === 'following'
                  ? 'text-white scale-105'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span>{tr.following}</span>
              {feedMode === 'following' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
              )}
            </button>

            <span className="text-white/30 text-xs">|</span>

            <button
              onClick={() => onChangeFeedMode('foryou')}
              className={`transition-all cursor-pointer relative py-1 ${
                feedMode === 'foryou'
                  ? 'text-white scale-105'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span>{tr.forYou}</span>
              {feedMode === 'foryou' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* Search Icon (Right) */}
          <button
            onClick={onOpenSearch}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <VideoPlayer
          video={currentVideo}
          isActive={true}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          onLike={() => onLikeVideo(currentVideo.id)}
        />

        {/* Video Overlay with Actions Rail */}
        <VideoOverlay
          video={currentVideo}
          onLike={() => onLikeVideo(currentVideo.id)}
          onToggleBookmark={() => onToggleBookmark(currentVideo.id)}
          onOpenComments={() => onOpenComments(currentVideo.id)}
          onOpenShare={() => onOpenShare(currentVideo)}
          onFollowAuthor={() => onFollowAuthor(currentVideo.author.id)}
          onSelectTag={onSelectTag}
          onViewProfile={onViewProfile}
          onDuet={() => onOpenDuet(currentVideo)}
          lang={lang}
        />
      </div>

      {/* Floating Vertical Next/Prev Nav Buttons on Desktop */}
      <div className="hidden md:flex flex-col gap-3 absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={() => onChangeIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-xl border border-slate-700/80 backdrop-blur-md cursor-pointer transition-all active:scale-95"
          aria-label="Previous Video"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        <button
          onClick={() => onChangeIndex(currentIndex + 1)}
          disabled={currentIndex === videos.length - 1}
          className="w-12 h-12 rounded-full bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-xl border border-slate-700/80 backdrop-blur-md cursor-pointer transition-all active:scale-95"
          aria-label="Next Video"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
