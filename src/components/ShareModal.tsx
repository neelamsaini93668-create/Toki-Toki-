import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Send, Share2, QrCode } from 'lucide-react';
import { VideoItem } from '../types';
import { Language, t } from '../utils/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
  onCopySuccess: () => void;
  lang: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  video,
  onCopySuccess,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const tr = t[lang];

  if (!isOpen) return null;

  const currentUrl = window.location.href.split('?')[0] + `?v=${video.id}`;
  const shareText = `टोका-टोकी (TokiToki) पर ${video.author.name} का यह शानदार वीडियो देखें: "${video.title}" ${currentUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(video.title)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-white">{tr.shareVia}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Thumbnail Snippet */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <div className={`w-12 h-16 rounded-xl bg-gradient-to-br ${video.gradient} shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md`}>
            Toki
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{video.title}</p>
            <p className="text-[11px] text-slate-400">{video.author.handle}</p>
            <p className="text-[10px] text-rose-400 font-medium mt-0.5">{video.views.toLocaleString()} व्यूज</p>
          </div>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-4 gap-3 py-1">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 fill-emerald-500" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">WhatsApp</span>
          </button>

          {/* Telegram */}
          <button
            onClick={handleTelegram}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Telegram</span>
          </button>

          {/* X / Twitter */}
          <button
            onClick={handleTwitter}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="font-bold text-base">𝕏</span>
            </div>
            <span className="text-[11px] font-medium text-slate-300">Twitter</span>
          </button>

          {/* QR Code */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-800 transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-300">QR Code</span>
          </button>
        </div>

        {/* QR Code expansion */}
        {showQr && (
          <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-32 h-32 bg-slate-100 border-2 border-slate-900 rounded-xl flex items-center justify-center p-2 text-center text-xs font-mono">
              [TOKI TOKI QR: {video.id}]
            </div>
            <p className="text-[11px] font-semibold mt-2 text-slate-700">स्कैन करके सीधे वीडियो देखें</p>
          </div>
        )}

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent px-2.5 text-xs text-slate-300 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer shadow-sm shadow-rose-500/30 whitespace-nowrap active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>कॉपी हुआ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{tr.copyLink}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
