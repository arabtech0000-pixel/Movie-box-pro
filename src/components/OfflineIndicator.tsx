import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-amber-500/90 backdrop-blur-md text-black font-semibold text-xs px-4 py-2 rounded-full shadow-2xl border border-amber-300/40 animate-bounce">
      <WifiOff className="w-4 h-4 text-black shrink-0" />
      <span>Offline Mode — Showing downloaded & cached content</span>
    </div>
  );
};
