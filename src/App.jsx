import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from './config/firebase';
import { cn } from "@/lib/utils";
import { doc, getDoc, collection, limit, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Play, Pause, Loader2, SkipBack, SkipForward, Volume2, ListMusic, X } from 'lucide-react';
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
import Social from './components/Social';
import Profile from './components/Profile/Profile';
import SearchResults from './components/SearchResults';
import CreatePost from './components/CreatePost';
import UserManagement from './Admin/UserManagement';
import VideoPlayer from './components/VideoPlayer';
import YouTube from 'react-youtube';
import endSound from '/sounds/end-sound.wav';
import MainPage from './components/MainPage';
import Users from './components/Users/Users';
import YoutubeDownloader from './pages/YoutubeDownloader';
import Library from './components/Library';
import PlaylistDetail from './components/PlaylistDetail';
import NotFound from './components/Error/404';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy'
import SharedPost from '@/components/SharedPost';
import Offline from './components/Offline/Offline';
import OfflineMode from './components/OfflineMode/OfflineMode';
import OfflineGuard from './components/OfflineGuard';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import './App.css';
import Lottie from 'lottie-react';
import lazyLoadingAnimation from '/src/lottie/lazy-loading.json';

function App() {
  const isMobileS = useMediaQuery({ maxWidth: 320 });
  const isMobileM = useMediaQuery({ minWidth: 321, maxWidth: 375 });
  const isMobileL = useMediaQuery({ minWidth: 376, maxWidth: 425 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [users, setUsers] = useState([]);
  const isOnline = useOnlineStatus();

  // Add offline status monitoring
  useEffect(() => {
    // Don't redirect if already on offline page or legal pages
    const exemptPaths = ['/offline', '/privacy-policy', '/terms-of-service', '/shared'];
    const isExemptPath = exemptPaths.some(path => location.pathname.startsWith(path));

    if (!isOnline && !isExemptPath && user) {
      toast({
        title: "Connection Lost",
        description: "You've gone offline. Redirecting to offline mode...",
        duration: 3000,
      });

      setTimeout(() => {
        navigate('/offline');
      }, 1000);
    }
  }, [isOnline, location.pathname, navigate, toast, user]);

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

  // Add this function to your component
  const fetchRecommendedTracks = async () => {
    if (isLoadingRecommendations) return;

    try {
      setIsLoadingRecommendations(true);

      // Option 1: If you have a dedicated recommendations collection
      // const recommendationsQuery = query(
      //   collection(db, "recommendations"),
      //   where("userId", "==", user?.uid),
      //   limit(10)
      // );

      // Option 2: If you want to use the tracks collection with random selection
      // This is a simple approach - for production, you might want a more sophisticated recommendation algorithm
      let tracksQuery;

      // If user has listened to tracks before, try to get similar genres/artists
      if (currentTrack) {
        tracksQuery = query(
          collection(db, "tracks"),
          where("channelTitle", "==", currentTrack.channelTitle), // Same artist/channel
          limit(5)
        );

        const similarArtistSnapshot = await getDocs(tracksQuery);
        let tracks = similarArtistSnapshot.docs.map(doc => ({
          id: doc.data().videoId || doc.id,
          title: doc.data().title,
          thumbnail: doc.data().thumbnail || doc.data().thumbnailUrl,
          channelTitle: doc.data().channelTitle,
          ...doc.data()
        }));

        // Filter out the current track
        tracks = tracks.filter(track => track.id !== currentTrack.id);

        // If we don't have enough tracks, get some random ones
        if (tracks.length < 5) {
          const randomQuery = query(
            collection(db, "tracks"),
            limit(10 - tracks.length)
          );

          const randomSnapshot = await getDocs(randomQuery);
          const randomTracks = randomSnapshot.docs.map(doc => ({
            id: doc.data().videoId || doc.id,
            title: doc.data().title,
            thumbnail: doc.data().thumbnail || doc.data().thumbnailUrl,
            channelTitle: doc.data().channelTitle,
            ...doc.data()
          })).filter(track =>
            track.id !== currentTrack.id &&
            !tracks.some(t => t.id === track.id)
          );

          tracks = [...tracks, ...randomTracks];
        }

        setRecommendedTracks(tracks);
      } else {
        // If no current track, just get random tracks
        tracksQuery = query(
          collection(db, "tracks"),
          limit(10)
        );

        const querySnapshot = await getDocs(tracksQuery);
        const tracks = querySnapshot.docs.map(doc => ({
          id: doc.data().videoId || doc.id,
          title: doc.data().title,
          thumbnail: doc.data().thumbnail || doc.data().thumbnailUrl,
          channelTitle: doc.data().channelTitle,
          ...doc.data()
        }));

        setRecommendedTracks(tracks);
      }

    } catch (error) {
      console.error("Error fetching recommended tracks:", error);
      // If there's an error, try to use search results as fallback
      if (searchResults.length > 0) {
        setRecommendedTracks(searchResults.filter(result =>
          !currentTrack || result.id !== currentTrack.id
        ));
      }
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Add this useEffect to load recommendations when needed
  useEffect(() => {
    if (user && (!recommendedTracks.length || recommendedTracks.length < 3)) {
      fetchRecommendedTracks();
    }
  }, [user, currentTrack]);

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
      } else if (recommendedTracks.length > 0) {
        // Play a random recommended track when queue is empty
        const randomIndex = Math.floor(Math.random() * recommendedTracks.length);
        const randomTrack = recommendedTracks[randomIndex];

        // Remove the selected track from recommendations to avoid immediate repeats
        const updatedRecommendations = [...recommendedTracks];
        updatedRecommendations.splice(randomIndex, 1);
        setRecommendedTracks(updatedRecommendations);

        setCurrentTrack(randomTrack);
        setIsPlaying(true);

        toast({
          title: "Playing Recommended Track",
          description: `${randomTrack.title}`,
          duration: 3000,
        });

        // Fetch more recommendations in the background
        if (updatedRecommendations.length < 3) {
          fetchRecommendedTracks();
        }
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

        // Try to fetch more recommendations for next time
        fetchRecommendedTracks();
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
    } else if (recommendedTracks.length > 0) {
      // Play a random recommended track when queue is empty
      const randomIndex = Math.floor(Math.random() * recommendedTracks.length);
      const randomTrack = recommendedTracks[randomIndex];

      // Remove the selected track from recommendations
      const updatedRecommendations = [...recommendedTracks];
      updatedRecommendations.splice(randomIndex, 1);
      setRecommendedTracks(updatedRecommendations);

      setCurrentTrack(randomTrack);
      setIsPlaying(true);
      setHasPlayedEndSound(false);

      toast({
        title: "Playing Recommended Track",
        description: `${randomTrack.title}`,
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
          description: "No more tracks available",
          duration: 3000,
        });

        // Try to fetch more recommendations
        fetchRecommendedTracks();
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

      {isLoading && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="w-32 h-32">
            <Lottie animationData={lazyLoadingAnimation} loop={true} />
          </div>
        </div>
      )}
      <Layout
        user={user}
        onSearchResults={setSearchResults}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setIsLoading={setIsLoading}
      >
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <MainPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth />} />

          {/* Offline route - accessible to everyone */}
          <Route path="/offline" element={<Offline />} />
          <Route path="/offline-mode" element={<OfflineMode />} />

          {/* Legal pages - accessible to everyone */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Add the shared post route here */}
          <Route path="/shared/:postId" element={<SharedPost />} />

          {!user ? (
            <Route path="*" element={<Navigate to="/" />} />
          ) : !user.isApproved ? (
            <Route path="*" element={<PendingApproval />} />
          ) : (
            <>
              {/* Wrap protected routes with OfflineGuard */}
              <Route path="/dashboard" element={
                <OfflineGuard>
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
                    users={users}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                  />
                </OfflineGuard>
              } />
              <Route path="/dashboard/social" element={
                <OfflineGuard>
                  <Social
                    currentUser={user}
                    currentTrack={currentTrack}
                    isPlayerPage={isPlayerPage}
                  />
                </OfflineGuard>
              } />
              <Route path="/dashboard/video/player" element={
                <OfflineGuard>
                  <VideoPlayer
                    currentUser={user}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onSkipBack={handleSkipBack}
                    onSkipForward={handleSkipForward}
                    queue={queue}
                    onAddToQueue={handleAddToQueue}
                  />
                </OfflineGuard>
              } />
              <Route path="/dashboard/profile/:userId" element={
                <OfflineGuard>
                  <Profile onPlayPause={handlePlayPause} />
                </OfflineGuard>
              } />
              <Route path="/dashboard/users" element={
                <OfflineGuard>
                  <Users />
                </OfflineGuard>
              } />
              <Route path="/dashboard/youtube-downloader" element={
                <OfflineGuard>
                  <YoutubeDownloader />
                </OfflineGuard>
              } />
              <Route path="/dashboard/search" element={
                <OfflineGuard>
                  <SearchResults
                    results={searchResults}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onAddToQueue={handleAddToQueue}
                    playlists={playlists}
                  />
                </OfflineGuard>
              } />
              <Route path="/dashboard/create-post" element={
                <OfflineGuard>
                  <CreatePost currentUser={user} />
                </OfflineGuard>
              } />
              <Route path="/dashboard/player" element={
                <OfflineGuard>
                  <FullPlayerView
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
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
                </OfflineGuard>
              } />
              <Route path="/dashboard/admin/users" element={
                <OfflineGuard>
                  {(user?.role === 'admin' || user?.role === 'owner') ?
                    <UserManagement currentUser={user} /> :
                    <Navigate to="/dashboard" />
                  }
                </OfflineGuard>
              } />
              <Route path="/dashboard/admin" element={
                <OfflineGuard>
                  {(user?.role === 'admin' || user?.role === 'owner') ?
                    <AdminDashboard currentUser={user} /> :
                    <Navigate to="/dashboard" />
                  }
                </OfflineGuard>
              } />
              <Route path="/dashboard/library" element={
                <OfflineGuard>
                  <Library
                    user={user}
                    onPlayPause={handlePlayPause}
                    onAddToQueue={handleAddToQueue}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                </OfflineGuard>
              } />
              <Route path="/dashboard/library/:id" element={
                <OfflineGuard>
                  <PlaylistDetail user={user} onPlayPause={handlePlayPause} />
                </OfflineGuard>
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
                  modestbranding: 1,
                  iv_load_policy: 3,
                  hl: 'en',
                  host: 'https://www.youtube-nocookie.com'
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
                "fixed bottom-0 left-0 right-0 border-t z-[50] bg-background animate-slide-up transition-[margin] duration-300 ease-in-out",
                isMobileS || isMobileM || isMobileL ? "p-2" : "p-4",
                isDesktop ? (isMinimized ? "ml-20" : "ml-64") : "",
                !isDesktop && sidebarOpen ? "ml-64" : "",
                !isOnline ? "bottom-10" : "bottom-0" // Adjust for offline indicator
              )}>
                {/* Your existing player UI code remains the same */}
                <div className={cn(
                  "flex mx-auto items-center",
                  isMobileS || isMobileM || isMobileL ? "max-w-full" : "max-w-7xl"
                )}>
                  {/* Track info - always visible */}
                  <div
                    className={cn(
                      "flex items-center cursor-pointer",
                      isMobileS || isMobileM || isMobileL ? "space-x-2 flex-1" : "space-x-4 w-1/4"
                    )}
                    onClick={() => navigate('/dashboard/player')}
                  >
                    <img
                      src={currentTrack?.thumbnail || "https://picsum.photos/seed/current/48/48"}
                      alt={currentTrack?.title || "Current song"}
                      className={cn(
                        "rounded-md object-cover",
                        isMobileS ? "w-8 h-8" : isMobileM || isMobileL ? "w-10 h-10" : "w-12 h-12"
                      )}
                    />
                    <div className="overflow-hidden">
                      <div className={`${isPlaying ? 'animate-marquee' : ''} whitespace-nowrap mb-1`}>
                        <p className={cn(
                          "font-medium truncate",
                          isMobileS ? "text-xs" : isMobileM || isMobileL ? "text-xs" : "text-sm"
                        )}>
                          {decodeHTMLEntities(currentTrack?.title) || "No track playing"}
                        </p>
                      </div>
                      <p className={cn(
                        "text-muted-foreground truncate",
                        isMobileS ? "text-[10px]" : isMobileM || isMobileL ? "text-[10px]" : "text-xs"
                      )}>
                        {decodeHTMLEntities(currentTrack?.channelTitle) || "Select a track"}
                      </p>
                    </div>
                  </div>

                  {/* Play/Pause button - always visible */}
                  <div className={cn(
                    "flex items-center",
                    isMobileS || isMobileM || isMobileL ? "ml-auto space-x-1" : "space-x-2 mb-2"
                  )}>
                    {/* On small screens, only show play/pause and queue buttons */}
                    {!(isMobileS || isMobileM || isMobileL) && (
                      <Button variant="ghost" size="icon" onClick={handleSkipBack}>
                        <SkipBack className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="icon"
                      onClick={() => currentTrack && handlePlayPause(currentTrack)}
                      className={isMobileS ? "h-8 w-8" : isMobileM || isMobileL ? "h-9 w-9" : ""}
                    >
                      {isPlaying ?
                        <Pause className={cn(isMobileS ? "h-3 w-3" : "h-4 w-4")} /> :
                        <Play className={cn(isMobileS ? "h-3 w-3" : "h-4 w-4")} />
                      }
                    </Button>

                    {/* Queue button for mobile */}
                    {(isMobileS || isMobileM || isMobileL) && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "hover:bg-accent",
                              isMobileS ? "h-8 w-8" : "h-9 w-9"
                            )}
                          >
                            <ListMusic className={cn(isMobileS ? "h-3 w-3" : "h-4 w-4")} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className={cn(
                            "p-0 border-2",
                            isMobileS ? "w-[calc(100vw-1rem)]" :
                              isMobileM ? "w-[calc(100vw-1.5rem)]" :
                                isMobileL ? "w-[calc(100vw-2rem)]" : "w-80"
                          )}
                          align="end"
                          side="top"
                        >
                          <div className={cn(
                            "border-b flex items-center justify-between",
                            isMobileS ? "p-2" : "p-3"
                          )}>
                            <div>
                              <h4 className={cn(
                                "font-semibold",
                                isMobileS ? "text-sm" : "text-base"
                              )}>Queue</h4>
                              <p className="text-xs text-muted-foreground">Up next in your queue</p>
                            </div>
                            {queue.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearQueue}
                                className="text-xs"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                          <div className={cn(
                            "overflow-auto",
                            isMobileS ? "max-h-[250px]" :
                              isMobileM ? "max-h-[270px]" :
                                "max-h-[300px]"
                          )}>
                            {currentTrack && (
                              <div className={cn(
                                "bg-accent/50",
                                isMobileS ? "p-2" : "p-3"
                              )}>
                                <p className="text-xs font-medium mb-1">Now Playing</p>
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={currentTrack.thumbnail}
                                    alt={currentTrack.title}
                                    className={cn(
                                      "rounded object-cover",
                                      isMobileS ? "w-8 h-8" : "w-10 h-10"
                                    )}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "font-medium truncate",
                                      isMobileS ? "text-xs" : "text-sm"
                                    )}>{currentTrack.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{currentTrack.channelTitle}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {queue.length > 0 ? (
                              queue.map((video, index) => (
                                <div
                                  key={video.id}
                                  className={cn(
                                    "flex items-center hover:bg-accent transition-colors",
                                    isMobileS ? "p-2 space-x-2" : "p-3 space-x-3"
                                  )}
                                >
                                  <span className={cn(
                                    "text-muted-foreground w-4",
                                    isMobileS ? "text-xs" : "text-sm"
                                  )}>{index + 1}</span>
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className={cn(
                                      "rounded object-cover",
                                      isMobileS ? "w-8 h-8" : "w-10 h-10"
                                    )}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "font-medium truncate",
                                      isMobileS ? "text-xs" : "text-sm"
                                    )}>{video.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{video.channelTitle}</p>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={isMobileS ? "h-6 w-6" : "h-8 w-8"}
                                      onClick={() => {
                                        const remainingTracks = queue.slice(index + 1);
                                        handlePlayPause(video, remainingTracks);
                                        setQueue(remainingTracks);
                                      }}
                                    >
                                      <Play className={isMobileS ? "h-3 w-3" : "h-4 w-4"} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "text-destructive hover:text-destructive",
                                        isMobileS ? "h-6 w-6" : "h-8 w-8"
                                      )}
                                      onClick={() => handleRemoveFromQueue(index)}
                                    >
                                      <X className={isMobileS ? "h-3 w-3" : "h-4 w-4"} />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <>
                                {recommendedTracks.length > 0 ? (
                                  <div>
                                    <div className={cn(
                                      "border-b flex items-center justify-between",
                                      isMobileS ? "p-2" : "p-3"
                                    )}>
                                      <p className={cn(
                                        "font-medium",
                                        isMobileS ? "text-xs" : "text-sm"
                                      )}>
                                        Recommended Tracks
                                      </p>
                                    </div>
                                    {recommendedTracks.slice(0, 5).map((track, index) => (
                                      <div
                                        key={track.id}
                                        className={cn(
                                          "flex items-center hover:bg-accent transition-colors",
                                          isMobileS ? "p-2 space-x-2" : "p-3 space-x-3"
                                        )}
                                      >
                                        <span className={cn(
                                          "text-muted-foreground w-4 flex-shrink-0",
                                          isMobileS ? "text-xs" : "text-sm"
                                        )}>•</span>
                                        <img
                                          src={track.thumbnail}
                                          alt={track.title}
                                          className={cn(
                                            "rounded object-cover flex-shrink-0",
                                            isMobileS ? "w-8 h-8" : "w-10 h-10"
                                          )}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className={cn(
                                            "font-medium truncate",
                                            isMobileS ? "text-xs" : "text-sm"
                                          )}>{track.title}</p>
                                          <p className="text-xs text-muted-foreground truncate">{track.channelTitle}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={isMobileS ? "h-6 w-6" : "h-8 w-8"}
                                          onClick={() => {
                                            setCurrentTrack(track);
                                            setIsPlaying(true);
                                            // Remove this track from recommendations
                                            setRecommendedTracks(prev => prev.filter(t => t.id !== track.id));
                                          }}
                                        >
                                          <Play className={isMobileS ? "h-3 w-3" : "h-4 w-4"} />
                                        </Button>
                                      </div>
                                    ))}
                                    {recommendedTracks.length > 5 && (
                                      <p className={cn(
                                        "text-center text-muted-foreground py-2",
                                        isMobileS ? "text-xs" : "text-sm"
                                      )}>
                                        +{recommendedTracks.length - 5} more recommendations
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className={cn(
                                    "text-center text-muted-foreground",
                                    isMobileS ? "p-3 text-xs" : "p-4 text-sm"
                                  )}>
                                    Queue is empty
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {!(isMobileS || isMobileM || isMobileL) && (
                      <>
                        <Button variant="ghost" size="icon" onClick={handleSkipForward}>
                          <SkipForward className="h-4 w-4" />
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
                            width="16"
                            height="16"
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
                      </>
                    )}
                  </div>

                  {/* Progress bar and volume - hide on small screens */}
                  {!(isMobileS || isMobileM || isMobileL) && (
                    <>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelTrack}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-accent">
                              <ListMusic className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="end">
                            <div className="p-4 border-b">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">Queue</h4>
                                  <p className="text-xs text-muted-foreground">Up next in your queue</p>
                                </div>
                                {queue.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearQueue}
                                    className="text-xs"
                                  >
                                    Clear Queue
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="max-h-96 overflow-auto">
                              {currentTrack && (
                                <div className="p-3 bg-accent/50">
                                  <p className="text-xs font-medium mb-2">Now Playing</p>
                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={currentTrack.thumbnail}
                                      alt={currentTrack.title}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                                      <p className="text-xs text-muted-foreground">{currentTrack.channelTitle}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
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
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const remainingTracks = queue.slice(index + 1);
                                          handlePlayPause(video, remainingTracks);
                                          setQueue(remainingTracks);
                                        }}
                                      >
                                        <Play className="h-4 w-4" />
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
                                ))
                              ) : (
                                <>
                                  {recommendedTracks.length > 0 ? (
                                    <div>
                                      <div className="p-3 border-b">
                                        <p className="text-sm font-medium">Recommended Tracks</p>
                                        <p className="text-xs text-muted-foreground">Will play automatically when queue ends</p>
                                      </div>
                                      {recommendedTracks.slice(0, 5).map((track, index) => (
                                        <div
                                          key={track.id}
                                          className="flex items-center space-x-3 p-3 hover:bg-accent transition-colors"
                                        >
                                          <span className="text-sm text-muted-foreground w-5">•</span>
                                          <img
                                            src={track.thumbnail}
                                            alt={track.title}
                                            className="w-10 h-10 rounded object-cover"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{track.title}</p>
                                            <p className="text-xs text-muted-foreground">{track.channelTitle}</p>
                                          </div>
                                          <div className="flex items-center">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => {
                                                setCurrentTrack(track);
                                                setIsPlaying(true);
                                                // Remove this track from recommendations
                                                setRecommendedTracks(prev => prev.filter(t => t.id !== track.id));
                                              }}
                                            >
                                              <Play className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => {
                                                handleAddToQueue(track);
                                                // Remove from recommendations to avoid duplicates
                                                setRecommendedTracks(prev => prev.filter(t => t.id !== track.id));
                                              }}
                                              className="text-primary hover:text-primary"
                                            >
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
                                              >
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                              </svg>
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                      {recommendedTracks.length > 5 && (
                                        <p className="text-xs text-center text-muted-foreground py-2">
                                          +{recommendedTracks.length - 5} more recommendations
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                      Queue is empty
                                      {isLoadingRecommendations && (
                                        <div className="mt-2 flex justify-center">
                                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            {/* Add a refresh recommendations button at the bottom */}
                            {recommendedTracks.length > 0 && (
                              <div className="p-2 border-t flex justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    setRecommendedTracks([]);
                                    fetchRecommendedTracks();
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                  </svg>
                                  Refresh Recommendations
                                </Button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}
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
      <App className="tracking-tighter" />
    </Router>
  );
}