import React from 'react';
import { Home, Users, Compass, Bell, User, Plus, Sparkles, Flame, Check } from 'lucide-react';
import { Creator } from '../types';
import { Language, t } from '../utils/translations';
import { TokiLogo } from './TokiLogo';

interface DesktopSidebarProps {
  currentTab: 'home' | 'explore' | 'inbox' | 'profile';
  feedMode: 'foryou' | 'following';
  onChangeTab: (tab: 'home' | 'explore' | 'inbox' | 'profile') => void;
  onChangeFeedMode: (mode: 'foryou' | 'following') => void;
  onOpenCreate: () => void;
  suggestedCreators: Creator[];
  onFollowCreator: (id: string) => void;
  lang: Language;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  feedMode,
  onChangeTab,
  onChangeFeedMode,
  onOpenCreate,
  suggestedCreators,
  onFollowCreator,
  lang,
}) => {
  const tr = t[lang];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-slate-800/80 p-4 space-y-6 overflow-y-auto no-scrollbar h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
      {/* Primary Navigation Links */}
      <div className="space-y-1">
        <button
          onClick={() => {
            onChangeTab('home');
            onChangeFeedMode('foryou');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'home' && feedMode === 'foryou'
              ? 'bg-[#fe2c55] text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{tr.forYou}</span>
        </button>

        <button
          onClick={() => {
            onChangeTab('home');
            onChangeFeedMode('following');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'home' && feedMode === 'following'
              ? 'bg-[#fe2c55] text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>{tr.following}</span>
        </button>

        <button
          onClick={() => onChangeTab('explore')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'explore'
              ? 'bg-[#fe2c55] text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>{tr.explore}</span>
        </button>

        <button
          onClick={() => onChangeTab('inbox')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'inbox'
              ? 'bg-[#fe2c55] text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>{tr.inbox}</span>
        </button>

        <button
          onClick={() => onChangeTab('profile')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            currentTab === 'profile'
              ? 'bg-[#fe2c55] text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{tr.profile}</span>
        </button>
      </div>

      {/* Suggested Creators */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider px-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>ट्रेंडिंग क्रिएटर्स</span>
        </div>

        <div className="space-y-2">
          {suggestedCreators.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={c.avatar}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{c.handle}</p>
                </div>
              </div>
              <button
                onClick={() => onFollowCreator(c.id)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  c.isFollowing
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-[#fe2c55]/20 text-[#fe2c55] hover:bg-[#fe2c55] hover:text-white'
                }`}
                title={c.isFollowing ? 'Following' : 'Follow'}
              >
                {c.isFollowing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Hashtags */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider px-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>लोकप्रिय विषय</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['#TokiToki', '#BhangraBeats', '#DelhiStreetFood', '#TokiComedy', '#DuetToki'].map(
            (tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>

      {/* Footer quiet copyright & info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
        <TokiLogo size="sm" showText={true} />
        <p className="pt-1">छोटे वीडियो, असीमित मनोरंजन। भारत का अपना मंच।</p>
      </div>
    </aside>
  );
};
