import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from './config/firebase';
import { cn } from "@/lib/utils";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, X } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from 'react-responsive';
import { ThemeProvider } from 'next-themes';
import { useLocation } from 'react-router-dom';
import Auth from './components/Auth/Auth';
import Dashboard from './components/App/Dashboard';
import FullPlayerView from './components/FullPlayerView';
import AdminDashboard from '@/Admin/AdminDashboard';
import PendingApproval from './components/Auth/PendingApproval';
import Layout from './components/Layout/layout';
import Profile from './components/Profile/Profile';
import Discover from './components/Discover';
import SearchResults from './components/SearchResults';
import CreatePost from './components/CreatePost';
import UserManagement from './Admin/UserManagement';
import YouTube from 'react-youtube';
import endSound from '/sounds/end-sound.wav';
import MainPage from './components/MainPage';
import Users from './components/Users/Users';
import Library from './components/Library';
import PlaylistDetail from './components/PlaylistDetail';
import NotFound from './components/Error/404';
import './App.css';

function App() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [user, setUser] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [volume, setVolume] = useState(75);
  const [playlists, setPlaylists] = useState([]);
  const [queue, setQueue] = useState([]);
  // State declarations with stable initial values
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timeUpdateInterval, setTimeUpdateInterval] = useState(null);
  const { toast } = useToast();
  const [hasShownPlaceholder, setHasShownPlaceholder] = useState(false);
  const [hasPlayedEndSound, setHasPlayedEndSound] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isPlayerPage = location.pathname === '/dashboard/player';
  const [isMinimized, setIsMinimized] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(
          collection(db, "users"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(usersQuery);
        const usersList = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);


  const handleLoopToggle = () => {
    setIsLooping(!isLooping);
    if (!isLooping) {
      setCurrentTime(0);
      player?.seekTo(0);
    }
  };

  // Add this handler function
  const handleRemoveFromQueue = (indexToRemove) => {
    setQueue(prevQueue => prevQueue.filter((_, index) => index !== indexToRemove));
    toast({
      title: "Removed from Queue",
      description: "Track removed from queue",
      duration: 3000,
    });
  };

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
      setHasPlayedEndSound(false);

      const interval = setInterval(() => {
        const time = Math.floor(event.target.getCurrentTime());
        const totalDuration = Math.floor(event.target.getDuration());

        setCurrentTime(prev => {
          if (Math.abs(prev - time) >= 1) {
            return time;
          }
          return prev;
        });
      }, 250);

      setTimeUpdateInterval(interval);
    }

    if (event.data === 0) { // Ended
      if (isLooping) {
        event.target.seekTo(0);
        event.target.playVideo();
        setCurrentTime(0);
      } else if (queue.length > 0) {
        const nextTrack = queue[0];
        const remainingTracks = queue.slice(1);
        setCurrentTrack(nextTrack);
        setQueue(remainingTracks);
        setIsPlaying(true);

        toast({
          title: "Now Playing",
          description: `${nextTrack.title}`,
          duration: 3000,
        });
      } else {
        const audio = new Audio(endSound);
        audio.play();
        setHasPlayedEndSound(true);
        setCurrentTrack(null);
        setIsPlaying(false);

        toast({
          title: "Queue Finished",
          description: "No more tracks in queue",
          duration: 3000,
        });
      }
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

  const clearQueue = () => {
    setQueue([]);
  };

  const handlePlayPause = (video, remainingTracks = []) => {
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

      if (remainingTracks.length > 0) {
        setQueue(remainingTracks);
        toast({
          title: "Playing from Queue",
          description: `${video.title} - ${remainingTracks.length} tracks remaining`,
          duration: 3000,
        });
      }
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
      const remainingTracks = queue.slice(1);
      setCurrentTrack(nextTrack);
      setQueue(remainingTracks);
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
          title: "Queue Finished",
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
    const fetchPlaylists = async () => {
      if (user) {
        const q = query(
          collection(db, "playlists"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const playlistsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlaylists(playlistsData);
      }
    };

    fetchPlaylists();
  }, [user]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(prevUser => ({
            ...prevUser,
            ...userData
          }));
          setIsApproved(userData.isApproved || false);

          addDoc(collection(db, "userActivities"), {
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
            action: "Logged in",
            timestamp: serverTimestamp()
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCancelTrack = () => {
    if (player) {
      player.stopVideo();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setQueue([]);
    setCurrentTime(0);
    setDuration(0);

    toast({
      title: "Playback Stopped",
      description: "Current track and queue cleared",
      duration: 3000,
    });
  };

  const decodeHTMLEntities = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster className="z-[99999]" />
      <Layout
        user={user}
        currentTrack={currentTrack}
        onSearchResults={setSearchResults}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <MainPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth />} />

          {!user ? (
            <Route path="*" element={<Navigate to="/" />} />
          ) : !user.isApproved ? (
            <Route path="*" element={<PendingApproval />} />
          ) : (
            <>
              <Route path="/dashboard" element={
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
                  currentUser={user}
                  users={users}  // Add this line
                />
              } />
              <Route path="/dashboard/profile/:userId" element={<Profile onPlayPause={handlePlayPause} />} />
              <Route path="/dashboard/users" element={<Users />} />
              <Route path="/dashboard/search" element={
                <SearchResults
                  results={searchResults}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onAddToQueue={handleAddToQueue}
                  playlists={playlists}
                />
              } />
              <Route path="/dashboard/create-post" element={<CreatePost currentUser={user} />} />
              <Route path="/dashboard/player" element={
                <FullPlayerView
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayPause={() => currentTrack && handlePlayPause(currentTrack)}
                  onSkipBack={handleSkipBack}
                  onSkipForward={handleSkipForward}
                  currentTime={currentTime}
                  duration={duration}
                  formatTime={formatTime}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  player={player}
                  setCurrentTime={setCurrentTime}
                  isLooping={isLooping}
                  handleLoopToggle={handleLoopToggle}
                  queue={queue}
                  handleRemoveFromQueue={handleRemoveFromQueue}
                />
              } />
              <Route path="/dashboard/admin/users" element={
                user?.role === 'admin' ? <UserManagement /> : <Navigate to="/dashboard" />
              } />
              <Route path="/dashboard/admin" element={
                user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />
              } />
              <Route path="/dashboard/discover" element={
                <Discover
                  onPlayPause={handlePlayPause}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onAddToQueue={handleAddToQueue}
                />
              } />
              <Route path="/dashboard/library" element={
                <Library
                  user={user}
                  onPlayPause={handlePlayPause}
                  onAddToQueue={handleAddToQueue}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                />
              } />
              <Route path="/dashboard/library/:id" element={
                <PlaylistDetail user={user} onPlayPause={handlePlayPause} />
              } />
            </>
          )}

          <Route path="*" element={<NotFound />} />
        </Routes>
        {user && (
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
              onReady={(event) => {
                setPlayer(event.target);
                event.target.setVolume(volume);
              }}
              onStateChange={handlePlayerStateChange}
              className="hidden"
            />
            {currentTrack && !isPlayerPage && (
              <div className={cn(
                "fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 border-l z-50 bg-background/95 backdrop-blur-sm shadow-lg transition-transform duration-300 ease-in-out",
                "flex flex-col justify-between",
                "animate-slide-in-right",
              )}>
                {/* Header Section */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-semibold">Now Playing</h3>
                    <p className="text-xs text-muted-foreground">Control your music</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLoopToggle}
                      className={cn(
                        "transition-colors duration-200",
                        isLooping ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
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
                        className={`transition-transform duration-200 ${isLooping ? "scale-110" : "scale-100"}`}
                      >
                        <path d="M17 2l4 4-4 4" />
                        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                        <path d="M7 22l-4-4 4-4" />
                        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelTrack}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Now Playing Section */}
                <div className="p-6">
                  <div className="space-y-6">
                    <img
                      src={currentTrack?.thumbnail || "https://picsum.photos/seed/current/300/300"}
                      alt={currentTrack?.title}
                      className="w-full aspect-square rounded-lg object-cover shadow-md hover:shadow-xl transition-shadow"
                    />
                    <div className="space-y-2">
                      <p className="font-medium text-lg line-clamp-2">{decodeHTMLEntities(currentTrack?.title)}</p>
                      <p className="text-sm text-muted-foreground">{decodeHTMLEntities(currentTrack?.channelTitle)}</p>
                    </div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="p-6 space-y-6 border-t border-b">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden group">
                      <div
                        className="h-full bg-primary rounded-full transition-all group-hover:bg-primary/80"
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
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex justify-center items-center space-x-6">
                    <Button variant="ghost" size="icon" className="hover:text-primary" onClick={handleSkipBack}>
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="default"
                      className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90"
                      onClick={() => currentTrack && handlePlayPause(currentTrack)}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-primary" onClick={handleSkipForward}>
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      className="flex-1"
                      onValueChange={(value) => handleVolumeChange(value[0])}
                    />
                  </div>
                </div>

                {/* Queue Section */}
                <div className="flex-1 overflow-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Queue</h4>
                        <p className="text-xs text-muted-foreground">Up next in your queue</p>
                      </div>
                      {queue.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearQueue} className="text-xs">
                          Clear Queue
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {queue.length > 0 ? (
                        queue.map((video, index) => (
                          <div
                            key={video.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                          >
                            <span className="text-sm text-muted-foreground w-5">{index + 1}</span>
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{video.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{video.channelTitle}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-primary"
                                onClick={() => {
                                  handlePlayPause(video);
                                  setQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
                                }}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-primary"
                                onClick={() => handleRemoveFromQueue(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          Queue is empty
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Layout>
    </ThemeProvider>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}