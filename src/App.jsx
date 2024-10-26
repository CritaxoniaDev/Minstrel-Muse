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

  const handleAddToQueue = (video) => {
    setQueue(prevQueue => [...prevQueue, video]);
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
    }
  };

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
              className="hidden"
            />

            <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-4">
                  <img
                    src={currentTrack?.thumbnail || "https://picsum.photos/seed/current/48/48"}
                    alt={currentTrack?.title || "Current song"}
                    className="rounded-md w-12 h-12"
                  />
                  <div>
                    <p className="text-sm font-medium">{currentTrack?.title || "No track playing"}</p>
                    <p className="text-xs text-muted-foreground">{currentTrack?.channelTitle || "Select a track"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
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
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    className="w-24"
                    onValueChange={(value) => handleVolumeChange(value[0])}
                  />
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
