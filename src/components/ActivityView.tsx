import React, { useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { NotificationItem, Creator } from '../types';
import { Language, t } from '../utils/translations';

interface ActivityViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onViewProfile: (user: Creator) => void;
  lang: Language;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  notifications,
  onMarkAllRead,
  onViewProfile,
  lang,
}) => {
  const [filter, setFilter] = useState<'all' | 'like' | 'comment' | 'follow'>('all');
  const tr = t[lang];

  const filteredNotifs = notifications.filter((n) => filter === 'all' || n.type === filter);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-500" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {tr.inbox}
          </h1>
        </div>
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>सभी पढ़े गए चिह्नित करें</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'सभी सूचनाएं' },
          { id: 'like', label: 'लाइक्स' },
          { id: 'comment', label: 'टिप्पणियां' },
          { id: 'follow', label: 'फॉलोअर्स' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Bell className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <p className="text-sm font-medium">कोई नई सूचना नहीं है</p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                !n.read
                  ? 'bg-slate-900/90 border-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* User avatar with type badge */}
                <div className="relative shrink-0">
                  <img
                    src={n.user.avatar}
                    alt={n.user.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 cursor-pointer"
                    onClick={() => onViewProfile(n.user)}
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white ring-2 ring-slate-950 ${
                      n.type === 'like'
                        ? 'bg-rose-500'
                        : n.type === 'comment'
                        ? 'bg-cyan-500'
                        : 'bg-emerald-500'
                    }`}
                  >
                    {n.type === 'like' && <Heart className="w-2.5 h-2.5 fill-current" />}
                    {n.type === 'comment' && <MessageCircle className="w-2.5 h-2.5" />}
                    {n.type === 'follow' && <UserPlus className="w-2.5 h-2.5" />}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-200 leading-snug">
                    <button
                      onClick={() => onViewProfile(n.user)}
                      className="font-bold text-white hover:underline cursor-pointer"
                    >
                      {n.user.name}
                    </button>{' '}
                    <span>{n.text}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{n.timestamp}</p>
                </div>
              </div>

              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 ml-2 animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
