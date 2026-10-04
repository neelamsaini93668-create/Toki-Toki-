import React from 'react';
import { Plus, Compass, Home, Bell, Languages } from 'lucide-react';
import { Language, t } from '../utils/translations';
import { Creator } from '../types';
import { TokiLogo } from './TokiLogo';

interface NavbarProps {
  currentTab: 'home' | 'explore' | 'inbox' | 'profile';
  feedMode: 'foryou' | 'following';
  onChangeTab: (tab: 'home' | 'explore' | 'inbox' | 'profile') => void;
  onChangeFeedMode: (mode: 'foryou' | 'following') => void;
  onOpenCreate: () => void;
  onOpenAuth: () => void;
  lang: Language;
  onToggleLang: () => void;
  currentUser: Creator;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  feedMode,
  onChangeTab,
  onChangeFeedMode,
  onOpenCreate,
  onOpenAuth,
  lang,
  onToggleLang,
  currentUser,
  unreadCount = 2,
}) => {
  const tr = t[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between transition-colors">
      {/* Zone 1: Brand title wordmark with official Toki Toki logo */}
      <button
        onClick={() => onChangeTab('home')}
        className="flex items-center gap-2 text-left focus-visible:outline-none group cursor-pointer"
        aria-label="TokiToki Home"
      >
        <TokiLogo size="md" showText={true} />
      </button>

      {/* Zone 2: Navigation Links (Single-line, quiet hover) */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-3 text-sm font-medium text-slate-300">
        <button
          onClick={() => {
            onChangeTab('home');
            onChangeFeedMode('foryou');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            currentTab === 'home' && feedMode === 'foryou'
              ? 'text-white bg-slate-800/90 font-semibold shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          {tr.forYou}
        </button>

        <button
          onClick={() => {
            onChangeTab('home');
            onChangeFeedMode('following');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            currentTab === 'home' && feedMode === 'following'
              ? 'text-white bg-slate-800/90 font-semibold shadow-inner'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          {tr.following}
        </button>

        <button
          onClick={() => onChangeTab('explore')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === 'explore'
              ? 'text-white bg-slate-800/90 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{tr.explore}</span>
        </button>

        <button
          onClick={() => onChangeTab('inbox')}
          className={`relative px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            currentTab === 'inbox'
              ? 'text-white bg-slate-800/90 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{tr.inbox}</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#fe2c55] ring-2 ring-slate-950 animate-pulse" />
          )}
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-700/60 rounded-xl transition-colors cursor-pointer"
          title={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
        >
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>

        {/* Create Video button with iconic [+] style */}
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#fe2c55] to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-xl shadow-md shadow-rose-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{tr.create}</span>
        </button>

        {/* Sign In / Login ID Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          title="साइन अप / लॉग इन आईडी बदलें"
        >
          <span className="text-[#fe2c55] font-extrabold hidden sm:inline">ID:</span>
          <span className="truncate max-w-[85px] sm:max-w-[110px] text-cyan-400 font-bold">
            {currentUser.handle}
          </span>
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`p-0.5 rounded-full transition-all cursor-pointer ${
            currentTab === 'profile' ? 'ring-2 ring-[#fe2c55] ring-offset-2 ring-offset-slate-950' : 'hover:opacity-90'
          }`}
          aria-label={tr.profile}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
        </button>
      </div>
    </header>
  );
};
