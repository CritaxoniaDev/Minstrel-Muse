import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX,
  ListMusic, X, Shuffle, Heart, Share2, MoreHorizontal, ChevronDown
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';

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
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!currentTrack) {
      navigate('/dashboard');
    } else {
      fetchRecommendations();
    }
  }, [currentTrack]);

  const fetchRecommendations = async () => {
    if (!currentTrack) return;

    setIsLoadingRecommendations(true);

    // Create a search query based on current track
    const query = `${currentTrack.title.split('-')[0]} ${currentTrack.channelTitle}`.trim();

    let attempts = 0;
    while (attempts < 13) {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: 8,
            key: getYoutubeApiKey(),
            type: 'video',
            q: `${query} music`,
            videoCategoryId: '10', // Music category
            relevanceLanguage: 'en',
            safeSearch: 'none'
          }
        });

        // Filter out the current track from recommendations
        const filteredResults = response.data.items.filter(
          item => item.id.videoId !== currentTrack.id
        ).map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url
        }));

        setRecommendations(filteredResults);
        setIsLoadingRecommendations(false);
        break;
      } catch (error) {
        console.error("YouTube API error:", error);
        attempts++;
        rotateApiKey(); // Try with a different API key

        if (attempts >= 13) {
          console.error("All API keys exhausted");
          setIsLoadingRecommendations(false);
        }
      }
    }
  };

  const decodeHTMLEntities = (text) => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Function to get volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 50) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  const playRecommendation = (track) => {
    // Check if the track is already playing
    if (currentTrack?.id === track.id) {
      // Toggle play/pause if it's the same track
      onPlayPause();
    } else {
      // If it's a different track, we want to play it immediately
      // This will replace the current track and start playing
      onPlayPause(track);

      // You could also add a toast notification
      // If you have access to the toast function, uncomment this:
      // toast({
      //   title: "Now Playing",
      //   description: `${track.title}`,
      //   duration: 3000,
      // });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
          <div className="flex-1 text-center">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Now Playing</h3>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Main player section */}
          <div className="flex flex-col items-center justify-center space-y-10 max-w-4xl mx-auto md:w-2/3">
            {/* Album Art with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrack?.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xs aspect-square relative group mx-auto border-2 border-dashed border-primary/50 p-2 rounded-xl" // Added dashed border
              >
                <img
                  src={currentTrack?.thumbnail || "https://picsum.photos/seed/current/400/400"}
                  alt={currentTrack?.title}
                  className="w-full h-full object-cover rounded-xl shadow-xl"
                />

                {/* Overlay with play button on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                  <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all"
                    onClick={onPlayPause}
                  >
                    {isPlaying ?
                      <Pause className="h-8 w-8" /> :
                      <Play className="h-8 w-8 ml-1" />
                    }
                  </Button>
                </div>

                {/* Floating animation effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl border border-muted"
                  animate={{
                    boxShadow: isPlaying
                      ? ['0 0 0 0 rgba(0,0,0,0)', '0 0 0 10px rgba(0,0,0,0.1)', '0 0 0 20px rgba(0,0,0,0)']
                      : '0 0 0 0 rgba(0,0,0,0)'
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'loop'
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Track Info */}
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <motion.h2
                  key={currentTrack?.id + "-title"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold"
                >
                  {decodeHTMLEntities(currentTrack?.title) || "No track playing"}
                </motion.h2>
                <motion.p
                  key={currentTrack?.id + "-artist"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-muted-foreground"
                >
                  {decodeHTMLEntities(currentTrack?.channelTitle) || "Select a track"}
                </motion.p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-6">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Heart className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Shuffle className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="relative h-1.5 group">
                  <div className="absolute inset-0 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="absolute h-full bg-primary rounded-full"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      animate={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div
                    className="absolute h-3 w-3 -top-0.5 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSkipBack}
                  className="h-12 w-12"
                >
                  <SkipBack className="h-7 w-7" />
                </Button>
                <Button
                  size="lg"
                  className={cn(
                    "h-16 w-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform",
                    isPlaying && "scale-105"
                  )}
                  onClick={() => currentTrack && onPlayPause(currentTrack)} // Ensure we pass the currentTrack
                >
                  {isPlaying ?
                    <Pause className="h-8 w-8" /> :
                    <Play className="h-8 w-8 ml-1" />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSkipForward}
                  className="h-12 w-12"
                >
                  <SkipForward className="h-7 w-7" />
                </Button>
              </div>

              {/* Volume and Queue Controls */}
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center space-x-2 w-1/3">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    {getVolumeIcon()}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    className="w-full"
                    onValueChange={(value) => onVolumeChange(value[0])}
                  />
                </div>

                <Button
                  variant={isLooping ? "secondary" : "ghost"}
                  size="sm"
                  onClick={handleLoopToggle}
                  className={cn(
                    "transition-colors duration-200",
                    isLooping ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={isLooping ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M17 2l4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="M7 22l-4-4 4-4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                  Loop
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <ListMusic className="h-5 w-5 mr-1" />
                      Queue
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold">Up Next</h4>
                      <p className="text-xs text-muted-foreground">Songs in your queue</p>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      {queue.length > 0 ? (
                        queue.map((video, index) => (
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
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onPlayPause(video)}
                                className="h-8 w-8"
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
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          <ListMusic className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>Your queue is empty</p>
                          <p className="text-xs mt-1">Add songs to continue your listening journey</p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Recommendations section (visible on md screens and up) */}
          <div className="hidden md:block md:w-1/3 mt-8 md:mt-0">
            <div className="bg-card rounded-lg p-4 border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recommended for you</h3>

              {isLoadingRecommendations ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-16 h-16 bg-muted rounded"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {recommendations.map((track) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center space-x-3 p-2 hover:bg-accent/50 rounded-md transition-colors cursor-pointer group"
                      onClick={() => playRecommendation(track)}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{decodeHTMLEntities(track.title)}</p>
                        <p className="text-xs text-muted-foreground">{decodeHTMLEntities(track.channelTitle)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recommendations available</p>
                  <p className="text-xs mt-1">Try playing a different track</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Based on</h4>
                <div className="flex items-center space-x-2">
                  <img
                    src={currentTrack?.thumbnail}
                    alt={currentTrack?.title}
                    className="w-8 h-8 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{decodeHTMLEntities(currentTrack?.title)}</p>
                    <p className="text-xs text-muted-foreground truncate">{decodeHTMLEntities(currentTrack?.channelTitle)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayerView;

