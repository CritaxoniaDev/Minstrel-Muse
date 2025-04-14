import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import mediaPlayerService from '../services/MediaPlayerService';

function MiniPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Listen for playback updates from the service
    const handlePlaybackUpdate = (event) => {
      setIsPlaying(event.detail.isPlaying);
      setCurrentTrack(event.detail.track);
    };

    window.addEventListener('music-playback-update', handlePlaybackUpdate);

    // Update progress bar
    const progressInterval = setInterval(() => {
      if (mediaPlayerService.isPlaying) {
        const currentTime = mediaPlayerService.getCurrentTime();
        const duration = mediaPlayerService.getDuration();
        setProgress((currentTime / duration) * 100 || 0);
      }
    }, 1000);

    return () => {
      window.removeEventListener('music-playback-update', handlePlaybackUpdate);
      clearInterval(progressInterval);
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      mediaPlayerService.pause();
    } else {
      mediaPlayerService.play();
    }
  };

  // If no track is loaded, don't show the mini player
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2 z-50">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Track info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {currentTrack.artwork && (
            <img 
              src={currentTrack.artwork} 
              alt={currentTrack.title} 
              className="h-10 w-10 rounded-md object-cover"
            />
          )}
          <div className="truncate">
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => mediaPlayerService.previous()}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            onClick={handlePlayPause}
            className="h-8 w-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => mediaPlayerService.next()}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 mt-1">
        <div 
          className="h-full bg-purple-600" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default MiniPlayer;
