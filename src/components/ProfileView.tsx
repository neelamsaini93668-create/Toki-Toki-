import React, { useState } from 'react';
import {
  User,
  Heart,
  Bookmark,
  Video,
  Edit3,
  Check,
  Plus,
  Share2,
  FileText,
  Trash2,
  Play,
  Clock,
  Music,
  Scissors,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Creator, VideoItem, VideoDraft } from '../types';
import { Language, t } from '../utils/translations';

interface ProfileViewProps {
  creator: Creator;
  isCurrentUser: boolean;
  videos: VideoItem[];
  likedVideos: VideoItem[];
  savedVideos: VideoItem[];
  drafts?: VideoDraft[];
  onSelectVideo: (videoId: string) => void;
  onFollowCreator?: (creatorId: string) => void;
  onUpdateBio?: (updatedName: string, updatedBio: string) => void;
  onOpenAuth?: () => void;
  onResumeDraft?: (draft: VideoDraft) => void;
  onDeleteDraft?: (draftId: string) => void;
  lang: Language;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  creator,
  isCurrentUser,
  videos,
  likedVideos,
  savedVideos,
  drafts = [],
  onSelectVideo,
  onFollowCreator,
  onUpdateBio,
  onOpenAuth,
  onResumeDraft,
  onDeleteDraft,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'liked' | 'saved' | 'drafts'>('my');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(creator.name);
  const [editBio, setEditBio] = useState(creator.bio || '');
  const tr = t[lang];

  // Total likes earned
  const totalLikes = videos.reduce((acc, v) => acc + v.likesCount, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateBio) {
      onUpdateBio(editName, editBio);
    }
    setIsEditing(false);
  };

  const currentDisplayVideos =
    activeTab === 'my' ? videos : activeTab === 'liked' ? likedVideos : savedVideos;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Profile Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar with ring */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-rose-500/30 overflow-hidden shadow-2xl">
              <img
                src={creator.avatar}
                alt={creator.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {creator.verified && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-900">
                ✓
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>{creator.name}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">{creator.handle}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                {isCurrentUser ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>प्रोफ़ाइल संपादित करें</span>
                    </button>
                    {onOpenAuth && (
                      <button
                        onClick={onOpenAuth}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:opacity-90 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>आईडी बदलें / लॉगिन</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => onFollowCreator && onFollowCreator(creator.id)}
                    className={`flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md ${
                      creator.isFollowing
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                    }`}
                  >
                    {creator.isFollowing ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{tr.followingBtn}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{tr.follow}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Bio text */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed pt-1">
              {creator.bio || 'TokiToki क्रिएटर! शॉर्ट वीडियो बनाना और शेयर करना मेरा जुनून है।'}
            </p>

            {/* Metrics stats (Zero-pill text format with typographic separator) */}
            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base sm:text-lg tabular-nums">
                  {creator.followers.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">{tr.followersCount}</span>
              </div>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base sm:text-lg tabular-nums">
                  142
                </span>
                <span className="text-xs text-slate-400">{tr.followingCount}</span>
              </div>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base sm:text-lg tabular-nums">
                  {totalLikes.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">{tr.likesReceived}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveProfile}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-lg text-white">प्रोफ़ाइल संपादित करें</h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">नाम (Name)</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">बायो (Bio)</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl cursor-pointer shadow-md shadow-rose-500/25"
              >
                सुरक्षित करें
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation Tabs (Functional Buttons) */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'my'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{tr.myVideos}</span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'liked'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{tr.likedVideos}</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{tr.savedVideos}</span>
        </button>

        {isCurrentUser && (
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              activeTab === 'drafts'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-300" />
            <span>ड्राफ़्ट्स</span>
            {drafts.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-sm">
                {drafts.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Videos & Drafts Grid */}
      {activeTab === 'drafts' ? (
        /* DRAFTS TAB VIEW: Unfinished Videos saved for later editing */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>अधूरे वीडियो ड्राफ़्ट्स (Unfinished Video Drafts)</span>
              </h3>
              <p className="text-xs text-slate-400">
                यहाँ आपके सहेजे गए अधूरे वीडियो हैं। 'एडिट जारी रखें' दबाकर एडिटिंग पूरी करें और पोस्ट करें।
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
              कुल: {drafts.length}
            </span>
          </div>

          {drafts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
              <FileText className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-300">कोई वीडियो ड्राफ़्ट नहीं मिला</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  वीडियो बनाते या ट्रिम करते समय 'ड्राफ़्ट में सहेजें' बटन दबाएं ताकि आप बाद में वहीं से संपादन जारी रख सकें।
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {drafts.map((draft) => {
                const dateStr = new Date(draft.updatedAt).toLocaleDateString('hi-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={draft.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all group hover:-translate-y-0.5"
                  >
                    {/* Video / Thumbnail preview banner */}
                    <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                      {draft.videoUrl ? (
                        <video
                          src={draft.videoUrl}
                          playsInline
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : draft.thumbnailUrl ? (
                        <img
                          src={draft.thumbnailUrl}
                          alt={draft.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-900/40 to-slate-900 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/40" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>ड्राफ़्ट</span>
                        </span>
                        {draft.speed && draft.speed !== 1 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/80 text-slate-950 text-[10px] font-black flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" />
                            <span>{draft.speed}x</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Info inside preview */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-slate-200 pointer-events-none">
                        <span className="flex items-center gap-1 truncate max-w-[170px] drop-shadow">
                          <Music className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{draft.sound?.title || 'Trending Track'}</span>
                        </span>
                        {draft.trimStart !== undefined && draft.trimEnd !== undefined && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-bold text-[10px] border border-cyan-500/40 flex items-center gap-0.5">
                            <Scissors className="w-2.5 h-2.5" />
                            <span>{(draft.trimEnd - draft.trimStart).toFixed(1)}s</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {draft.title || 'शीर्षक रहित ड्राफ़्ट'}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {draft.caption || 'कोई कैप्शन नहीं जोड़ा गया है...'}
                        </p>
                        <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span>सहेजा गया: {dateStr}</span>
                        </div>
                      </div>

                      {/* Actions: Resume Editing & Delete */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                        {onResumeDraft && (
                          <button
                            type="button"
                            onClick={() => onResumeDraft(draft)}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            title="इस ड्राफ़्ट को स्टूडियो में खोलें और एडिटिंग पूरी करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>एडिट जारी रखें</span>
                          </button>
                        )}

                        {onDeleteDraft && (
                          <button
                            type="button"
                            onClick={() => onDeleteDraft(draft.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 text-xs font-semibold border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title="ड्राफ़्ट हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : currentDisplayVideos.length === 0 ? (
        <div className="text-center py-16 text-slate-500 space-y-2">
          <Video className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-sm font-medium">{tr.noVideos}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {currentDisplayVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => onSelectVideo(vid.id)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${vid.gradient} opacity-80 group-hover:scale-105 transition-transform duration-300`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 space-y-1">
                <p className="text-xs font-semibold text-white line-clamp-2 drop-shadow leading-snug">
                  {vid.title}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span className="tabular-nums font-medium">{vid.likesCount.toLocaleString()}</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="tabular-nums">{vid.views.toLocaleString()} व्यूज</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
