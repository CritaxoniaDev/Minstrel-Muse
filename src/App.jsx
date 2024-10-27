import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from './components/Header';
import Auth from './components/Auth/Auth';
import Dashboard from './components/App/Dashboard';
import PendingApproval from './components/Auth/PendingApproval';
import Profile from './components/Profile/Profile';
import SearchResults from './components/SearchResults';
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import YouTube from 'react-youtube';
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast";
import endSound from '/sounds/end-sound.wav';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [volume, setVolume] = useState(75);
  const [queue, setQueue] = useState([]);
  // State declarations with stable initial values
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timeUpdateInterval, setTimeUpdateInterval] = useState(null);
  const { toast } = useToast();
  const [hasShownPlaceholder, setHasShownPlaceholder] = useState(false);
  const [hasPlayedEndSound, setHasPlayedEndSound] = useState(false);

  // Clear interval when changing tracks
  useEffect(() => {
    if (timeUpdateInterval) {
      clearInterval(timeUpdateInterval);
    }

    if (player && currentTrack) {
      player.loadVideoById(currentTrack.id);
      player.setVolume(volume);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentTrack]);

  // Enhanced player state handler with stable updates
  const handlePlayerStateChange = (event) => {
    if (event.data === 1) { // Playing
      setDuration(Math.floor(event.target.getDuration()));
      setHasPlayedEndSound(false); // Reset the flag when a new track starts playing

      const interval = setInterval(() => {
        const time = Math.floor(event.target.getCurrentTime());
        const totalDuration = Math.floor(event.target.getDuration());

        setCurrentTime(prev => {
          if (Math.abs(prev - time) >= 1) {
            return time;
          }
          return prev;
        });

        // Only trigger handleSkipForward if we're at the very end
        if (time >= totalDuration && !hasPlayedEndSound) {
          handleSkipForward();
          clearInterval(interval);
        }
      }, 250);

      setTimeUpdateInterval(interval);
      return () => clearInterval(interval);
    }
  };

  // Stable time formatting with fixed decimal places
  const formatTime = (seconds) => {
    if (!seconds) return "0:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddToQueue = (video) => {
    if (!currentTrack) {
      setCurrentTrack(video);
      setIsPlaying(true);
      toast({
        title: "Now Playing",
        description: `${video.title}`,
        duration: 3000,
      });
    } else {
      setQueue(prevQueue => [...prevQueue, video]);
      toast({
        title: "Added to Queue",
        description: `${video.title} has been added to your queue`,
        duration: 3000,
      });
    }
  };

  const handlePlayPause = (video) => {
    if (currentTrack?.id === video.id) {
      if (isPlaying) {
        player?.pauseVideo();
      } else {
        player?.playVideo();
      }
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(video);
      setIsPlaying(true);
    }
  };

  // Add the player controls
  const handleVolumeChange = (newValue) => {
    setVolume(newValue);
    if (player) {
      player.setVolume(newValue);
    }
  };

  const handleSkipBack = () => {
    if (searchResults.length > 0) {
      const currentIndex = searchResults.findIndex(video => video.id === currentTrack?.id);
      const previousIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
      const previousTrack = searchResults[previousIndex];
      setCurrentTrack(previousTrack);
      setIsPlaying(true);
    }
  };

  const handleSkipForward = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setCurrentTrack(nextTrack);
      setQueue(queue.slice(1));
      setIsPlaying(true);
      setHasPlayedEndSound(false);
      toast({
        title: "Now Playing",
        description: `${nextTrack.title}`,
        duration: 3000,
      });
    } else {
      if (!hasPlayedEndSound) {
        const audio = new Audio(endSound);
        audio.play();
        setHasPlayedEndSound(true);
        setCurrentTrack(null);
        setIsPlaying(false);
        toast({
          title: "Playback Ended",
          description: "No more tracks in queue",
          duration: 3000,
        });
      }
    }
  };

  // Add this useEffect to handle the one-time notification
  useEffect(() => {
    if (!currentTrack && !hasShownPlaceholder) {
      toast({
        title: "Welcome to MinstrelMuse!",
        description: "Select a track to start playing",
        duration: 3000,
      });
      setHasShownPlaceholder(true);
    }
  }, []);

  const onPlayerReady = (event) => {
    setPlayer(event.target);
  };

  useEffect(() => {
    if (player && currentTrack) {
      player.loadVideoById(currentTrack.id);
      player.setVolume(volume);
    }
  }, [currentTrack]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsApproved(userDoc.data().isApproved || false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Toaster />
      <div className="min-h-screen bg-background">
        <Header user={user} isApproved={isApproved} onSearchResults={setSearchResults} />
        <div className="pt-10">
          <Routes>
            <Route
              path="/"
              element={user ? (
                isApproved ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <PendingApproval />
                )
              ) : (
                <Auth />
              )}
            />
            <Route
              path="/dashboard/*"
              element={
                user ? (
                  isApproved ? (
                    <Dashboard
                      user={user}
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                      onSkipBack={handleSkipBack}
                      onSkipForward={handleSkipForward}
                      volume={volume}
                      onVolumeChange={handleVolumeChange}
                      queue={queue}
                    />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/dashboard/profile"
              element={user ? <Profile /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/profile/:userId"
              element={user ? <Profile /> : <Navigate to="/" />}
            />
            <Route
              path="/dashboard/search"
              element={
                <SearchResults
                  results={searchResults}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onAddToQueue={handleAddToQueue}
                />
              }
            />
          </Routes>
        </div>

        {/* Only show player and controls if user is authenticated and approved */}
        {user && isApproved && (
          <>
            <YouTube
              videoId={currentTrack?.id}
              opts={{
                height: '0',
                width: '0',
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  enablejsapi: 1,
                  origin: window.location.origin,
                  playsinline: 1,
                  rel: 0,
                  modestbranding: 1
                },
              }}
              onReady={onPlayerReady}
              onStateChange={handlePlayerStateChange}
              className="hidden"
            />

            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
              <div className="flex max-w-7xl mx-auto items-center">
                <div className="flex items-center space-x-4 w-1/4">
                  <img
                    src={currentTrack?.thumbnail || "https://picsum.photos/seed/current/48/48"}
                    alt={currentTrack?.title || "Current song"}
                    className="rounded-md w-12 h-12 object-cover"
                  />
                  <div className="overflow-hidden">
                    <div className={`${isPlaying ? 'animate-marquee' : ''} whitespace-nowrap mb-1`}>
                      <p className="text-sm font-medium">{currentTrack?.title || "No track playing"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{currentTrack?.channelTitle || "Select a track"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Button variant="ghost" size="icon" onClick={handleSkipBack}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => currentTrack && handlePlayPause(currentTrack)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSkipForward}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col items-center w-1/2 px-4">
                  <div className="w-full flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <div className="relative flex-1 h-1 bg-secondary rounded-full overflow-hidden group">
                      <div
                        className="absolute h-full bg-primary rounded-full transition-all"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
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
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 w-1/4">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    className="w-24"
                    onValueChange={(value) => handleVolumeChange(value[0])}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePlayPause(video)}
                            >
                              {currentTrack?.id === video.id && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
