import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface VideoPlayerModalProps {
  item: MediaItem;
  initialEpisode?: number;
  initialSeason?: number;
  onClose: () => void;
  onDownload?: (item: MediaItem, options?: { season?: number; episode?: number }) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  initialEpisode = 1,
  initialSeason = 1,
  onClose,
}) => {
  const [isLandscape, setIsLandscape] = useState<boolean>(true);
  const [season] = useState<number>(initialSeason);
  const [episode] = useState<number>(initialEpisode);

  // Mobile / Browser Back Button Handling
  useEffect(() => {
    window.history.pushState({ modal: 'video_player_modal' }, '');
    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  const displayTitle =
    item.type === 'tv'
      ? `${item.title} - S${season}E${episode}`
      : item.title;

  return (
    <div
      id="video-player-modal"
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none"
    >
      <CustomVideoPlayer
        item={{
          ...item,
          title: displayTitle,
        }}
        isLandscape={isLandscape}
        onToggleLandscape={() => setIsLandscape((prev) => !prev)}
        onBack={onClose}
        autoPlay={true}
      />
    </div>
  );
};
