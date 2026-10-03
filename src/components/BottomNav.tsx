import React from 'react';
import { Home, Tv, Crown, ArrowDownToLine, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  downloadCount: number;
  userAvatar?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  downloadCount,
  userAvatar,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'shorttv',
      label: 'Series',
      icon: <Tv className="w-5 h-5" />,
    },
    {
      id: 'premium',
      label: 'Premium',
      icon: <Crown className="w-5 h-5" />,
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: <ArrowDownToLine className="w-5 h-5" />,
      badge: downloadCount > 0 ? downloadCount : undefined,
    },
    {
      id: 'me',
      label: 'Me',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e15]/95 backdrop-blur-md border-t border-white/5 max-w-md mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around h-15 px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 relative cursor-pointer ${
                isActive ? 'text-[#00df82]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                {item.id === 'me' && userAvatar && !userAvatar.startsWith('data:image/svg') ? (
                  <div
                    className={`w-5 h-5 rounded-full overflow-hidden border transition-all ${
                      isActive
                        ? 'border-[#00df82] ring-2 ring-[#00df82]/50 scale-110'
                        : 'border-zinc-500 opacity-80'
                    }`}
                  >
                    <img
                      src={userAvatar}
                      alt="Me"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  item.icon
                )}

                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#00df82] text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {item.id === 'me' && (!userAvatar || userAvatar.startsWith('data:image/svg')) && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#00df82]" />
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-[#00df82]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
