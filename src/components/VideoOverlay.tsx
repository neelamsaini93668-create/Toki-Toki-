import React from 'react';
import { Heart, MessageSquare, Bookmark, Share2, Music, Check, Plus, Layers, Scissors, Sparkles } from 'lucide-react';
import { VideoItem, Creator } from '../types';
import { Language, t } from '../utils/translations';

interface VideoOverlayProps {
  video: VideoItem;
  onLike: () => void;
  onToggleBookmark: () => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onFollowAuthor: () => void;
  onSelectTag: (tag: string) => void;
  onViewProfile: (author: Creator) => void;
  onDuet?: () => void;
  lang: Language;
}

export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  video,
  onLike,
  onToggleBookmark,
  onOpenComments,
  onOpenShare,
  onFollowAuthor,
  onSelectTag,
  onViewProfile,
  onDuet,
  lang,
}) => {
  const tr = t[lang];

  // Number formatter for likes/comments/shares
  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end p-4 pb-6 sm:p-5 sm:pb-7">
      {/* Main Bottom Section: Info + Right Action Rail */}
      <div className="flex items-end justify-between gap-3">
        {/* Left Side: Creator Bio, Title, Description, Sound Bar */}
        <div className="flex-1 max-w-[76%] sm:max-w-[72%] text-white pointer-events-auto space-y-2">
          {/* Creator handle & follow badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewProfile(video.author)}
              className="flex items-center gap-1.5 hover:underline group text-left cursor-pointer"
            >
              <span className="font-bold text-sm sm:text-base tracking-tight text-white drop-shadow-md">
                {video.author.handle}
              </span>
              {video.author.verified && (
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                  ✓
                </span>
              )}
            </button>
            <span className="text-[11px] text-slate-300 drop-shadow">· {video.timestamp}</span>

            {/* Badges for Veo 3 AI generation and Trimming */}
            {video.isAIGenerated && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-rose-600 text-white text-[10px] font-bold flex items-center gap-1 shadow drop-shadow">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>Veo 3 AI</span>
              </span>
            )}
            {video.trimStart !== undefined && video.trimEnd !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/90 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow">
                <Scissors className="w-2.5 h-2.5 text-slate-950" />
                <span>{(video.trimEnd - video.trimStart).toFixed(1)}s Trim</span>
              </span>
            )}
          </div>

          {/* Video Description & Title */}
          <p className="text-xs sm:text-sm text-slate-100 line-clamp-2 leading-relaxed drop-shadow-md font-medium">
            {video.description}
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {video.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag(tag);
                }}
                className="text-xs font-bold text-white hover:text-rose-300 hover:underline transition-colors drop-shadow cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Sound Track Bar with spinning music note */}
          <div className="flex items-center gap-2 pt-1 text-slate-200">
            <Music className="w-3.5 h-3.5 text-white shrink-0 animate-pulse" />
            <div className="overflow-hidden w-full max-w-[200px] sm:max-w-[240px] whitespace-nowrap">
              <span className="text-xs font-semibold inline-block drop-shadow">
                {video.sound.title} · {video.sound.artist}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Action Buttons Rail (Screenshot 1 & 2) */}
        <div className="flex flex-col items-center gap-3.5 pointer-events-auto pb-1">
          {/* 1. Creator Avatar with Follow Plus Icon */}
          <div className="relative mb-1">
            <button
              onClick={() => onViewProfile(video.author)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white overflow-hidden shadow-lg active:scale-90 transition-transform cursor-pointer"
            >
              <img
                src={video.author.avatar}
                alt={video.author.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
            {!video.author.isFollowing && (
              <button
                onClick={onFollowAuthor}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#fe2c55] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                title={tr.follow}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}
          </div>

          {/* 2. Like Button (Heart) */}
          <div className="flex flex-col items-center">
            <button
              onClick={onLike}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-75 ${
                video.isLiked ? 'text-[#fe2c55]' : 'text-white hover:text-rose-400'
              }`}
              aria-label={tr.like}
            >
              <Heart
                className={`w-7 h-7 transition-transform ${
                  video.isLiked ? 'fill-[#fe2c55] stroke-[#fe2c55] scale-110' : ''
                }`}
              />
            </button>
            <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
              {formatCount(video.likesCount)}
            </span>
          </div>

          {/* 3. Comment Button (Speech bubble) */}
          <div className="flex flex-col items-center">
            <button
              onClick={onOpenComments}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md flex items-center justify-center text-white hover:text-cyan-400 transition-all cursor-pointer active:scale-75"
              aria-label={tr.comment}
            >
              <MessageSquare className="w-7 h-7" />
            </button>
            <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
              {formatCount(video.commentsCount)}
            </span>
          </div>

          {/* 4. Bookmark / Favorite Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={onToggleBookmark}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-75 ${
                video.isBookmarked ? 'text-amber-400' : 'text-white hover:text-amber-400'
              }`}
              aria-label={tr.saved}
            >
              <Bookmark
                className={`w-7 h-7 transition-transform ${
                  video.isBookmarked ? 'fill-amber-400 stroke-amber-400 scale-110' : ''
                }`}
              />
            </button>
            <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
              {formatCount(video.bookmarksCount)}
            </span>
          </div>

          {/* 5. Share Button (Curved arrow) */}
          <div className="flex flex-col items-center">
            <button
              onClick={onOpenShare}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md flex items-center justify-center text-white hover:text-emerald-400 transition-all cursor-pointer active:scale-75"
              aria-label={tr.share}
            >
              <Share2 className="w-6 h-6" />
            </button>
            <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
              {formatCount(video.sharesCount)}
            </span>
          </div>

          {/* 6. Duet Button (Screenshot 3 feature) */}
          {onDuet && (
            <div className="flex flex-col items-center">
              <button
                onClick={onDuet}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer active:scale-75"
                title="इस वीडियो के साथ ड्युएट बनाएं"
              >
                <Layers className="w-6 h-6" />
              </button>
              <span className="text-[10px] font-bold text-white drop-shadow-md mt-0.5">
                ड्युएट
              </span>
            </div>
          )}

          {/* 7. Spinning Vinyl Disc with Floating Music Notes */}
          <div className="relative mt-0.5">
            <div className="w-11 h-11 rounded-full p-1 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center animate-spin-slow">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center relative">
                {video.sound.cover ? (
                  <img
                    src={video.sound.cover}
                    alt={video.sound.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-4 h-4 text-rose-400" />
                )}
                {/* Center hole of record */}
                <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
              </div>
            </div>

            {/* Floating Music Notes */}
            <span className="absolute -top-3 -right-2 text-cyan-400 text-xs font-bold animate-float-note">
              ♪
            </span>
            <span className="absolute -top-5 right-2 text-[#fe2c55] text-xs font-bold animate-float-note [animation-delay:1s]">
              ♫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
