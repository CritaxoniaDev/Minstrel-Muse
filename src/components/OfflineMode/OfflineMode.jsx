import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Shuffle, 
  Repeat, 
  Music, 
  WifiOff,
  ArrowLeft,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const OfflineMode = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes default
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Sample offline tracks (these would normally be cached from previous sessions)
  const [offlineTracks] = useState([
    {
      id: 1,
      title: "Cached Song 1",
      artist: "Offline Artist",
      album: "Cached Album",
      thumbnail: "https://picsum.photos/seed/track1/300/300",
      duration: 210
    },
    {
      id: 2,
      title: "Downloaded Track",
      artist: "Local Artist",
      album: "Offline Collection",
      thumbnail: "https://picsum.photos/seed/track2/300/300",
      duration: 195
    },
    {
      id: 3,
      title: "Cached Melody",
      artist: "Stored Music",
      album: "Offline Hits",
      thumbnail: "https://picsum.photos/seed/track3/300/300",
      duration: 240
    },
    {
      id: 4,
      title: "Local Favorite",
      artist: "Cached Artist",
      album: "Downloaded Songs",
      thumbnail: "https://picsum.photos/seed/track4/300/300",
      duration: 165
    },
    {
      id: 5,
      title: "Offline Rhythm",
      artist: "Stored Beats",
      album: "Cached Collection",
      thumbnail: "https://picsum.photos/seed/track5/300/300",
      duration: 220
    }
  ]);

  // Set initial track
  useEffect(() => {
    if (offlineTracks.length > 0 && !currentTrack) {
      setCurrentTrack(offlineTracks[0]);
      setDuration(offlineTracks[0].duration);
    }
  }, [offlineTracks, currentTrack]);

  // Simulate playback progress
  useEffect(() => {
    let interval;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast({
        title: "Now Playing",
        description: `${currentTrack?.title} - ${currentTrack?.artist}`,
        duration: 2000,
      });
    }
  };

  const handleNext = () => {
    const nextIndex = isShuffled 
      ? Math.floor(Math.random() * offlineTracks.length)
      : (currentTrackIndex + 1) % offlineTracks.length;
    
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(offlineTracks[nextIndex]);
    setDuration(offlineTracks[nextIndex].duration);
    setCurrentTime(0);
    
    toast({
      title: "Next Track",
      description: `${offlineTracks[nextIndex].title}`,
      duration: 2000,
    });
  };

  const handlePrevious = () => {
    const prevIndex = currentTrackIndex === 0 
      ? offlineTracks.length - 1 
      : currentTrackIndex - 1;
    
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(offlineTracks[prevIndex]);
    setDuration(offlineTracks[prevIndex].duration);
    setCurrentTime(0);
    
    toast({
      title: "Previous Track",
      description: `${offlineTracks[prevIndex].title}`,
      duration: 2000,
    });
  };

  const handleTrackSelect = (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setDuration(track.duration);
    setCurrentTime(0);
    setIsPlaying(true);
    
    toast({
      title: "Now Playing",
      description: `${track.title} - ${track.artist}`,
      duration: 2000,
    });
  };

  const handleSeek = (value) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value) => {
    setVolume(value[0]);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    toast({
      title: isShuffled ? "Shuffle Off" : "Shuffle On",
      description: isShuffled ? "Playing in order" : "Playing randomly",
      duration: 2000,
    });
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
    toast({
      title: isRepeating ? "Repeat Off" : "Repeat On",
      description: isRepeating ? "No repeat" : "Repeating current track",
      duration: 2000,
    });
  };

  const handleBackToOffline = () => {
    navigate('/offline');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={handleBackToOffline}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-red-500" />
              <h1 className="text-lg font-semibold">Offline Mode</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
              <span className="text-xs text-red-600 dark:text-red-400">No Internet</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Track Display */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                {currentTrack ? (
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                    <img
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className="w-48 h-48 rounded-lg object-cover shadow-lg"
                    />
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
                      <p className="text-lg text-muted-foreground mb-1">{currentTrack.artist}</p>
                      <p className="text-sm text-muted-foreground mb-4">{currentTrack.album}</p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <Slider
                          value={[currentTime]}
                          max={duration}
                          step={1}
                          onValueChange={handleSeek}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No track selected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Player Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={isShuffled ? "text-primary" : "text-muted-foreground"}
                  >
                    <Shuffle className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={isShuffled ? "text-primary" : "text-muted-foreground"}
                  >
                    <Shuffle className="h-5 w-5" />
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={handlePrevious}>
                    <SkipBack className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={handlePlayPause}
                    className="h-14 w-14 rounded-full"
                    disabled={!currentTrack}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={handleNext}>
                    <SkipForward className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRepeat}
                    className={isRepeating ? "text-primary" : "text-muted-foreground"}
                  >
                    <Repeat className="h-5 w-5" />
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">{volume}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Playlist/Queue */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Cached Tracks</h3>
                  <span className="text-sm text-muted-foreground">
                    {offlineTracks.length} songs
                  </span>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {offlineTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                        currentTrack?.id === track.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleTrackSelect(track, index)}
                    >
                      <div className="relative">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        {currentTrack?.id === track.id && isPlaying && (
                          <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(track.duration)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Offline Features */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Offline Features</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Cached music playback</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Local playlist management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Player controls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Limited to cached content</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>No new downloads</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-muted rounded-full">
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">
              You're in offline mode. Connect to internet for full features.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;
