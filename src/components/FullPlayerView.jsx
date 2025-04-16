import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useMediaQuery } from 'react-responsive';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX,
  ListMusic, X, Shuffle, Loader2, Heart, Share2, MoreHorizontal, ChevronDown
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

  // Responsive breakpoints
  const isMobileS = useMediaQuery({ maxWidth: 320 });
  const isMobileM = useMediaQuery({ minWidth: 321, maxWidth: 375 });
  const isMobileL = useMediaQuery({ minWidth: 376, maxWidth: 425 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [lyrics, setLyrics] = useState("");
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState(null);


  // Helper for small mobile screens
  const isSmallMobile = isMobileS || isMobileM || isMobileL;

  const fetchLyrics = async () => {
    if (!currentTrack) return;

    setIsLoadingLyrics(true);
    setLyricsError(null);

    try {
      // Use a lyrics API service - this is just an example
      // You'll need to replace this with an actual lyrics API
      const response = await axios.get('https://api.lyrics.ovh/v1/', {
        params: {
          artist: currentTrack.channelTitle,
          title: currentTrack.title.split('-')[0].trim()
        }
      });

      if (response.data && response.data.lyrics) {
        setLyrics(response.data.lyrics);
      } else {
        setLyricsError("No lyrics found for this song");
      }
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setLyricsError("Unable to load lyrics at this time");
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  useEffect(() => {
    if (currentTrack) {
      fetchLyrics();
    }
  }, [currentTrack?.id]);

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
    if (volume === 0) return <VolumeX className={cn(isSmallMobile ? "h-4 w-4" : "h-5 w-5")} />;
    if (volume < 50) return <Volume1 className={cn(isSmallMobile ? "h-4 w-4" : "h-5 w-5")} />;
    return <Volume2 className={cn(isSmallMobile ? "h-4 w-4" : "h-5 w-5")} />;
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
      <div className={cn(
        "container mx-auto",
        isSmallMobile ? "px-2 py-4 pb-16" : isMobile ? "px-3 py-5 pb-20" : "px-4 py-6 pb-24"
      )}>
        {/* Header with back button */}
        <div className={cn(
          "flex items-center",
          isSmallMobile ? "mb-4" : isMobile ? "mb-6" : "mb-8"
        )}>
          <Button
            variant="ghost"
            size={isSmallMobile ? "sm" : "icon"}
            onClick={() => navigate('/dashboard')}
            className={isSmallMobile ? "h-8 w-8" : ""}
          >
            <ChevronDown className={cn(
              isSmallMobile ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6"
            )} />
          </Button>
          <div className="flex-1 text-center">
            <h3 className={cn(
              "font-medium uppercase tracking-wider text-muted-foreground",
              isSmallMobile ? "text-xs" : "text-sm"
            )}>Now Playing</h3>
          </div>
          <Button
            variant="ghost"
            size={isSmallMobile ? "sm" : "icon"}
            className={isSmallMobile ? "h-8 w-8" : ""}
          >
            <MoreHorizontal className={cn(
              isSmallMobile ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6"
            )} />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Main player section */}
          <div className={cn(
            "flex flex-col items-center justify-center mx-auto",
            isSmallMobile ? "space-y-6" : isMobile ? "space-y-8" : "space-y-10",
            "md:w-2/3 max-w-4xl"
          )}>
            {/* Album Art with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrack?.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-full aspect-square relative group mx-auto border-2 border-dashed border-primary/50 rounded-xl",
                  isSmallMobile ? "max-w-[200px] p-1.5" :
                    isMobile ? "max-w-[250px] p-1.5" :
                      "max-w-xs p-2"
                )}
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
                    className={cn(
                      "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all",
                      isSmallMobile ? "h-12 w-12" : isMobile ? "h-14 w-14" : "h-16 w-16"
                    )}
                    onClick={onPlayPause}
                  >
                    {isPlaying ?
                      <Pause className={cn(
                        isSmallMobile ? "h-6 w-6" : isMobile ? "h-7 w-7" : "h-8 w-8"
                      )} /> :
                      <Play className={cn(
                        isSmallMobile ? "h-6 w-6 ml-0.5" : isMobile ? "h-7 w-7 ml-0.5" : "h-8 w-8 ml-1"
                      )} />
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
            <div className={cn(
              "w-full space-y-6",
              isSmallMobile ? "max-w-[280px] space-y-4" :
                isMobile ? "max-w-[320px] space-y-5" :
                  "max-w-md space-y-8"
            )}>
              <div className="text-center space-y-2">
                <motion.h2
                  key={currentTrack?.id + "-title"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "font-bold",
                    isSmallMobile ? "text-xl" : isMobile ? "text-2xl" : "text-3xl"
                  )}
                >
                  {decodeHTMLEntities(currentTrack?.title) || "No track playing"}
                </motion.h2>
                <motion.p
                  key={currentTrack?.id + "-artist"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "text-muted-foreground",
                    isSmallMobile ? "text-sm" : isMobile ? "text-base" : "text-lg"
                  )}
                >
                  {decodeHTMLEntities(currentTrack?.channelTitle) || "Select a track"}
                </motion.p>
              </div>

              {/* Action Buttons */}
              <div className={cn(
                "flex items-center justify-center",
                isSmallMobile ? "space-x-4" : "space-x-6"
              )}>
                <Button
                  variant="ghost"
                  size={isSmallMobile ? "sm" : "icon"}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    isSmallMobile ? "h-8 w-8" : ""
                  )}
                >
                  <Heart className={cn(
                    isSmallMobile ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6"
                  )} />
                </Button>
                <Button
                  variant="ghost"
                  size={isSmallMobile ? "sm" : "icon"}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    isSmallMobile ? "h-8 w-8" : ""
                  )}
                >
                  <Shuffle className={cn(
                    isSmallMobile ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6"
                  )} />
                </Button>
                <Button
                  variant="ghost"
                  size={isSmallMobile ? "sm" : "icon"}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    isSmallMobile ? "h-8 w-8" : ""
                  )}
                >
                  <Share2 className={cn(
                    isSmallMobile ? "h-4 w-4" : isMobile ? "h-5 w-5" : "h-6 w-6"
                  )} />
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
              <div className={cn(
                "flex items-center justify-center",
                isSmallMobile ? "space-x-4" : "space-x-6"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSkipBack}
                  className={cn(
                    isSmallMobile ? "h-10 w-10" : isMobile ? "h-11 w-11" : "h-12 w-12"
                  )}
                >
                  <SkipBack className={cn(
                    isSmallMobile ? "h-5 w-5" : isMobile ? "h-6 w-6" : "h-7 w-7"
                  )} />
                </Button>
                <Button
                  size="lg"
                  className={cn(
                    "rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform",
                    isPlaying && "scale-105",
                    isSmallMobile ? "h-12 w-12" : isMobile ? "h-14 w-14" : "h-16 w-16"
                  )}
                  onClick={() => currentTrack && onPlayPause(currentTrack)}
                >
                  {isPlaying ?
                    <Pause className={cn(
                      isSmallMobile ? "h-6 w-6" : isMobile ? "h-7 w-7" : "h-8 w-8"
                    )} /> :
                    <Play className={cn(
                      isSmallMobile ? "h-6 w-6 ml-0.5" : isMobile ? "h-7 w-7 ml-0.5" : "h-8 w-8 ml-1"
                    )} />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSkipForward}
                  className={cn(
                    isSmallMobile ? "h-10 w-10" : isMobile ? "h-11 w-11" : "h-12 w-12"
                  )}
                >
                  <SkipForward className={cn(
                    isSmallMobile ? "h-5 w-5" : isMobile ? "h-6 w-6" : "h-7 w-7"
                  )} />
                </Button>
              </div>

              {/* Volume and Queue Controls */}
              <div className={cn(
                "flex items-center justify-between",
                isSmallMobile ? "mt-4 flex-col space-y-3" : isMobile ? "mt-6" : "mt-8"
              )}>
                <div className={cn(
                  "flex items-center space-x-2",
                  isSmallMobile ? "w-full" : "w-1/3"
                )}>
                  <Button
                    variant="ghost"
                    size={isSmallMobile ? "sm" : "icon"}
                    className="text-muted-foreground hover:text-foreground"
                  >
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

                {isSmallMobile ? (
                  <div className="flex items-center justify-between w-full space-x-2">
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
                        width="16"
                        height="16"
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
                          <ListMusic className="h-4 w-4 mr-1" />
                          Queue
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[calc(100vw-2rem)] p-0"
                        align="center"
                        side="top"
                      >
                        <div className="p-3 border-b">
                          <h4 className="font-semibold text-sm">Up Next</h4>
                          <p className="text-xs text-muted-foreground">Songs in your queue</p>
                        </div>
                        <div className="max-h-[350px] overflow-auto">
                          {queue.length > 0 ? (
                            queue.map((video, index) => (
                              <div
                                key={video.id}
                                className="flex items-center space-x-2 p-2 hover:bg-accent transition-colors"
                              >
                                <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{video.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{video.channelTitle}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onPlayPause(video)}
                                    className="h-6 w-6 p-0"
                                  >
                                    {currentTrack?.id === video.id && isPlaying ? (
                                      <Pause className="h-3 w-3" />
                                    ) : (
                                      <Play className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFromQueue(index)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              <ListMusic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Your queue is empty</p>
                              <p className="text-xs mt-1">Add songs to continue your listening journey</p>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations and Lyrics section (visible on md screens and up) */}
          <div className="hidden md:block md:w-1/3 mt-8 md:mt-0">
            <div className="bg-card rounded-lg p-4 border shadow-sm">
              <Tabs defaultValue="recommendations" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                </TabsList>

                <TabsContent value="recommendations" className="mt-0">
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
                    <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
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
                </TabsContent>

                <TabsContent value="lyrics" className="mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Lyrics</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchLyrics}
                      disabled={isLoadingLyrics}
                    >
                      {isLoadingLyrics ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <path d="M16 16h5v5" />
                        </svg>
                      )}
                      Refresh
                    </Button>
                  </div>

                  <div className="bg-card/50 rounded-md border p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                    {isLoadingLyrics ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading lyrics...</p>
                      </div>
                    ) : lyricsError ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{lyricsError}</p>
                        <p className="text-xs mt-2">
                          Note: Lyrics may not be available for all songs or may be protected by copyright.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(currentTrack?.title + ' ' + currentTrack?.channelTitle + ' lyrics')}`, '_blank')}
                        >
                          Search lyrics online
                        </Button>
                      </div>
                    ) : lyrics ? (
                      <div className="whitespace-pre-line text-sm">
                        <p className="mb-4 text-xs text-muted-foreground italic">
                          Note: These lyrics are provided for personal, non-commercial use only.
                        </p>
                        <div className="space-y-4">
                          {/* Display lyrics in a way that respects copyright */}
                          <p>Lyrics for "{decodeHTMLEntities(currentTrack?.title)}" by {decodeHTMLEntities(currentTrack?.channelTitle)} are available.</p>
                          <p className="text-muted-foreground">
                            Due to copyright restrictions, we can only show a preview or link to official sources.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(currentTrack?.title + ' ' + currentTrack?.channelTitle + ' lyrics')}`, '_blank')}
                          >
                            View full lyrics online
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No lyrics available for this track</p>
                        <p className="text-xs mt-1">Try another song or search online</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(currentTrack?.title + ' ' + currentTrack?.channelTitle + ' lyrics')}`, '_blank')}
                        >
                          Search lyrics online
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Now Playing</h4>
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayerView;