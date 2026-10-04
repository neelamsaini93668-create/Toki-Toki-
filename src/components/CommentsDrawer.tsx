import React, { useState } from 'react';
import { X, Heart, Send, MessageCircle } from 'lucide-react';
import { CommentItem } from '../types';
import { Language, t } from '../utils/translations';
import { audioEngine } from '../utils/audioEngine';
import { AudioTranscriber } from './AudioTranscriber';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  comments: CommentItem[];
  onAddComment: (videoId: string, text: string) => void;
  onLikeComment: (commentId: string) => void;
  lang: Language;
}

const QUICK_EMOJIS = ['❤️', '🔥', '😂', '👏', '🇮🇳', '🙌', '💯', '✨'];

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  videoId,
  comments,
  onAddComment,
  onLikeComment,
  lang,
}) => {
  const [inputText, setInputText] = useState('');
  const tr = t[lang];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddComment(videoId, inputText.trim());
    setInputText('');
    audioEngine.playLikeSound();
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 w-full sm:max-w-md h-[75vh] sm:h-full bg-slate-900 border-t sm:border-t-0 sm:border-l border-slate-800 rounded-t-3xl sm:rounded-none flex flex-col shadow-2xl overflow-hidden">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-white">
              {tr.commentsTitle} ({comments.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <MessageCircle className="w-12 h-12 text-slate-600 mb-2" />
              <p className="text-sm font-medium">कोई टिप्पणी नहीं है। पहली टिप्पणी करें!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 group">
                <img
                  src={c.author.avatar}
                  alt={c.author.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {c.author.name}
                    </span>
                    {c.author.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[9px]">
                        ✓
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">· {c.timestamp}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 break-words leading-relaxed">
                    {c.text}
                  </p>
                </div>
                {/* Comment like */}
                <button
                  onClick={() => onLikeComment(c.id)}
                  className={`flex flex-col items-center gap-0.5 shrink-0 p-1 transition-colors cursor-pointer ${
                    c.isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  aria-label="Like comment"
                >
                  <Heart className={`w-4 h-4 ${c.isLiked ? 'fill-rose-500' : ''}`} />
                  <span className="text-[10px] font-medium tabular-nums">{c.likes}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Emojis & Voice Transcription Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="text-lg hover:scale-125 active:scale-95 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
          <AudioTranscriber
            buttonLabel="माइक"
            onTranscribeComplete={(text) => setInputText((prev) => (prev ? `${prev} ${text}` : text))}
          />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={tr.writeComment}
            className="flex-1 bg-slate-800/90 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-rose-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all cursor-pointer shadow-md shadow-rose-500/20"
            aria-label={tr.post}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
