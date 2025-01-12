import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, X, Music2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FullPlayerView = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  currentTime,
  duration,
  formatTime,
  volume,
  onVolumeChange,
  player,
  setCurrentTime,
  isLooping,
  handleLoopToggle,
  queue,
  handleRemoveFromQueue
}) => {

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentTrack) {
      navigate('/dashboard');
    }
  }, [currentTrack]);

  const decodeHTMLEntities = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-full max-w-md aspect-square"
        >
          <img
            src={currentTrack?.thumbnail || "https://picsum.photos/seed/current/400/400"}
            alt={currentTrack?.title}
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </motion.div>


        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold truncate">
              {decodeHTMLEntities(currentTrack?.title) || "No track playing"}
            </h2>
            <p className="text-muted-foreground">
              {decodeHTMLEntities(currentTrack?.channelTitle) || "Select a track"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative h-2">
              <div className="absolute inset-0 bg-secondary rounded-full">
                <div
                  className="absolute h-full bg-primary rounded-full transition-all"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div
                  className="absolute h-4 w-4 -top-1 bg-primary rounded-full shadow-lg transform -translate-y-1/4 transition-all group-hover:scale-110"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: 'translateX(-50%)' }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime || 0}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    setCurrentTime(time);
                    player?.seekTo(time);
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onSkipBack}>
              <SkipBack className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
              onClick={onPlayPause}
            >
              {isPlaying ?
                <Pause className="h-8 w-8" /> :
                <Play className="h-8 w-8 ml-1" />
              }
            </Button>
            <Button variant="ghost" size="icon" onClick={onSkipForward}>
              <SkipForward className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLoopToggle}
              className={`transition-colors duration-200 ${isLooping
                ? "text-primary hover:text-primary/80"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={isLooping ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${isLooping ? "scale-110" : "scale-100"
                  }`}
              >
                <path d="M17 2l4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="M7 22l-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              className="w-full"
              onValueChange={(value) => onVolumeChange(value[0])}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <ListMusic className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h4 className="font-semibold">Queue</h4>
                  <p className="text-xs text-muted-foreground">Up next in your queue</p>
                </div>
                <div className="max-h-96 overflow-auto">
                  {queue.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-center space-x-3 p-3 hover:bg-accent transition-colors"
                    >
                      <span className="text-sm text-muted-foreground w-5">{index + 1}</span>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPlayPause(video)}
                        >
                          {currentTrack?.id === video.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromQueue(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayerView;
