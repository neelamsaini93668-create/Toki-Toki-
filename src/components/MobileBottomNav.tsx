import React from 'react';
import { Home, Search, MessageSquare, User, Plus } from 'lucide-react';
import { Language, t } from '../utils/translations';

interface MobileBottomNavProps {
  currentTab: 'home' | 'explore' | 'inbox' | 'profile';
  onChangeTab: (tab: 'home' | 'explore' | 'inbox' | 'profile') => void;
  onOpenCreate: () => void;
  lang: Language;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenCreate,
  lang,
  unreadCount = 2,
}) => {
  const tr = t[lang];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-slate-900 px-2 py-1 safe-area-pb">
      <div className="grid grid-cols-5 items-center justify-items-center h-14">
        {/* 1. Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-label={tr.forYou}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            {tr.forYou}
          </span>
        </button>

        {/* 2. Discover / Search (Screenshot 1: Discover / Search) */}
        <button
          onClick={() => onChangeTab('explore')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'explore' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-label="Discover"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            Discover
          </span>
        </button>

        {/* 3. CENTER HERO: Iconic TikTok [+] Button with Cyan & Red drop edges */}
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer group active:scale-90 transition-transform"
          aria-label={tr.create}
        >
          <div className="relative w-11 h-7.5 flex items-center justify-center">
            {/* Left cyan border block */}
            <div className="absolute inset-y-0 -left-1 w-9 rounded-lg bg-[#00f2fe]" />
            {/* Right red border block */}
            <div className="absolute inset-y-0 -right-1 w-9 rounded-lg bg-[#fe2c55]" />
            {/* Center white block */}
            <div className="relative z-10 w-9 h-7.5 rounded-lg bg-white flex items-center justify-center text-slate-950 shadow-md">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
          </div>
        </button>

        {/* 4. Inbox */}
        <button
          onClick={() => onChangeTab('inbox')}
          className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'inbox' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-label={tr.inbox}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            {tr.inbox}
          </span>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 px-1 py-0.2 rounded-full bg-[#fe2c55] text-white text-[9px] font-extrabold ring-1 ring-black">
              {unreadCount}
            </span>
          )}
        </button>

        {/* 5. Profile ("Me") */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            currentTab === 'profile' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
          aria-label={tr.profile}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            {tr.profile}
          </span>
        </button>
      </div>
    </nav>
  );
};
