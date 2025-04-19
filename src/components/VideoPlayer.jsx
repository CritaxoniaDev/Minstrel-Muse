import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Heart, Share2, ListMusic, ChevronLeft, Bookmark, Plus, History,
    Music2, Clock, ThumbsUp, MessageSquare, Eye, Calendar
} from 'lucide-react';

const VideoPlayer = ({ currentUser, currentTrack, isPlaying, onPlayPause, onSkipBack, onSkipForward, queue, onAddToQueue }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [videoDetails, setVideoDetails] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const { toast } = useToast();
    const searchParams = new URLSearchParams(location.search);
    const videoId = searchParams.get('v');
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);

    const fetchVideoDetails = async (videoId) => {
        if (!videoId) return;
        
        try {
          setLoading(true);
          
          let attempts = 0;
          while (attempts < 13) { // Try all available API keys
            try {
              const apiKey = getYoutubeApiKey();
              
              // Get video details
              const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                  part: 'snippet,statistics,contentDetails',
                  id: videoId,
                  key: apiKey
                }
              });
              
              if (videoResponse.data.items && videoResponse.data.items.length > 0) {
                const videoData = videoResponse.data.items[0];
                const snippet = videoData.snippet;
                const statistics = videoData.statistics;
                
                setVideoDetails({
                  id: videoData.id,
                  title: snippet.title,
                  channelTitle: snippet.channelTitle,
                  channelId: snippet.channelId,
                  description: snippet.description,
                  publishedAt: new Date(snippet.publishedAt),
                  thumbnail: snippet.thumbnails.high.url,
                  viewCount: parseInt(statistics.viewCount).toLocaleString(),
                  likeCount: parseInt(statistics.likeCount).toLocaleString(),
                  commentCount: parseInt(statistics.commentCount).toLocaleString(),
                  duration: videoData.contentDetails.duration
                });
                
                // Add to user history
                if (currentUser?.uid) {
                  try {
                    await addDoc(collection(db, "userHistory"), {
                      userId: currentUser.uid,
                      videoId: videoId,
                      title: snippet.title,
                      channelTitle: snippet.channelTitle,
                      thumbnail: snippet.thumbnails.medium.url,
                      timestamp: serverTimestamp()
                    });
                  } catch (error) {
                    console.error("Error adding to history:", error);
                  }
                }
                
                setLoading(false);
                break; // Exit the loop if successful
              }
            } catch (error) {
              console.error("YouTube API error:", error);
              attempts++;
              rotateApiKey(); // Try with a different API key
              
              if (attempts >= 13) {
                console.error("All API keys exhausted");
                setLoading(false);
                toast({
                  title: "API Limit Reached",
                  description: "Unable to load video details. Please try again later.",
                  variant: "destructive"
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching video details:", error);
          setLoading(false);
          toast({
            title: "Error",
            description: "Failed to load video details. Please try again.",
            variant: "destructive"
          });
        }
      };

    const fetchRecentlyPlayed = async () => {
        if (!currentUser?.uid) return;
        
        try {
          const recentlyPlayedQuery = query(
            collection(db, "userHistory"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc"),
            limit(5)
          );
          
          const querySnapshot = await getDocs(recentlyPlayedQuery);
          const recentTracks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));
          
          // Filter out the current video
          const filteredTracks = recentTracks.filter(track => track.videoId !== videoId);
          setRecentlyPlayed(filteredTracks);
        } catch (error) {
          console.error("Error fetching recently played:", error);
        }
      };

    // Fetch video details
    const fetchRecommendations = async (videoId) => {
        if (!videoId) return;

        try {
            setLoading(true);

            // First get the video details to use for recommendations
            const apiKey = getYoutubeApiKey();
            const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'snippet',
                    id: videoId,
                    key: apiKey
                }
            });

            if (videoResponse.data.items && videoResponse.data.items.length > 0) {
                const videoData = videoResponse.data.items[0];
                setVideoDetails({
                    id: videoData.id,
                    title: videoData.snippet.title,
                    channelTitle: videoData.snippet.channelTitle,
                    description: videoData.snippet.description,
                    publishedAt: new Date(videoData.snippet.publishedAt),
                    thumbnail: videoData.snippet.thumbnails.high.url
                });

                // Create a search query based on current video
                const query = `${videoData.snippet.title.split('-')[0]} ${videoData.snippet.channelTitle}`.trim();

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

                        // Filter out the current video from recommendations
                        const filteredResults = response.data.items.filter(
                            item => item.id.videoId !== videoId
                        ).map(item => ({
                            id: item.id.videoId,
                            title: item.snippet.title,
                            channelTitle: item.snippet.channelTitle,
                            thumbnail: item.snippet.thumbnails.medium.url,
                            publishedAt: new Date(item.snippet.publishedAt)
                        }));

                        setRelatedVideos(filteredResults);
                        setLoading(false);
                        break;
                    } catch (error) {
                        console.error("YouTube API error:", error);
                        attempts++;
                        rotateApiKey(); // Try with a different API key

                        if (attempts >= 13) {
                            console.error("All API keys exhausted");
                            setLoading(false);
                            toast({
                                title: "API Limit Reached",
                                description: "Unable to load recommendations. Please try again later.",
                                variant: "destructive"
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching video details:", error);
            setLoading(false);
            toast({
                title: "Error",
                description: "Failed to load video details. Please try again.",
                variant: "destructive"
            });
        }
    };

    // Then in your useEffect:
    useEffect(() => {
        if (videoId) {
            fetchVideoDetails(videoId);
            fetchRecommendations(videoId);
            fetchRecentlyPlayed(); 

            // Add to user history
            if (currentUser?.uid) {
                const addToHistory = async () => {
                    try {
                        await addDoc(collection(db, "userHistory"), {
                            userId: currentUser.uid,
                            videoId: videoId,
                            title: videoDetails?.title || "",
                            channelTitle: videoDetails?.channelTitle || "",
                            thumbnail: videoDetails?.thumbnail || "",
                            timestamp: serverTimestamp()
                        });
                    } catch (error) {
                        console.error("Error adding to history:", error);
                    }
                };

                if (videoDetails) {
                    addToHistory();
                }
            }
        }
    }, [videoId, currentUser]);

    const handleAddToQueue = (video) => {
        if (onAddToQueue) {
            onAddToQueue(video);
            toast({
                title: "Added to Queue",
                description: `${video.title} has been added to your queue`,
                duration: 3000,
            });
        }
    };

    const handleShare = () => {
        const shareUrl = `https://minstrelmuse.vercel.app/dashboard/player?v=${videoId}`;
        navigator.clipboard.writeText(shareUrl);
        toast({
            title: "Link Copied",
            description: "Video link has been copied to clipboard",
            duration: 3000,
        });
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // This would need to be implemented in the actual YouTube player
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
            <div className="container mx-auto px-4 py-6">
                {/* Header with navigation and context */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => navigate('/dashboard')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Discover</span>
                    </Button>

                    {!loading && (
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                            <Music2 className="h-4 w-4 text-primary" />
                            <span>Now Playing from</span>
                            <span className="font-medium text-foreground">{videoDetails?.channelTitle}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {loading ? (
                            <>
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted/50 animate-pulse">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Music2 className="h-16 w-16 text-muted-foreground/20" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-3/4 rounded-lg" />
                                <Skeleton className="h-5 w-1/2 rounded-lg" />
                                <div className="flex gap-3">
                                    <Skeleton className="h-10 w-24 rounded-full" />
                                    <Skeleton className="h-10 w-24 rounded-full" />
                                    <Skeleton className="h-10 w-24 rounded-full" />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Video Player with custom overlay */}
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`}
                                        className="absolute inset-0 w-full h-full"
                                        title={videoDetails?.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>

                                    {/* Custom overlay gradient at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                                </div>

                                {/* Title and stats in a card */}
                                <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
                                    <h1 className="text-2xl font-bold mb-3 leading-tight">{videoDetails?.title}</h1>

                                    <div className="flex flex-wrap items-center gap-4 mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Music2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{videoDetails?.channelTitle}</p>
                                                <p className="text-xs text-muted-foreground">Artist</p>
                                            </div>
                                        </div>

                                        <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                                <Eye className="h-3.5 w-3.5 text-primary" />
                                                <span>{videoDetails?.viewCount}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                                <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                                                <span>{videoDetails?.likeCount}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                                <span>{formatDistanceToNow(videoDetails?.publishedAt, { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons in a stylish layout */}
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                                            onClick={() => {
                                                if (currentTrack?.id === videoId) {
                                                    onPlayPause(currentTrack);
                                                } else {
                                                    onPlayPause({
                                                        id: videoId,
                                                        title: videoDetails?.title,
                                                        channelTitle: videoDetails?.channelTitle,
                                                        thumbnail: videoDetails?.thumbnail
                                                    });
                                                }
                                            }}
                                        >
                                            {currentTrack?.id === videoId && isPlaying ? (
                                                <><Pause className="h-4 w-4" /> Pause</>
                                            ) : (
                                                <><Play className="h-4 w-4" /> Play</>
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="rounded-full gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                                            onClick={() => handleAddToQueue({
                                                id: videoId,
                                                title: videoDetails?.title,
                                                channelTitle: videoDetails?.channelTitle,
                                                thumbnail: videoDetails?.thumbnail
                                            })}
                                        >
                                            <Plus className="h-4 w-4" /> Add to Queue
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="rounded-full gap-2 border-primary/20 hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/30"
                                        >
                                            <Heart className="h-4 w-4" /> Favorite
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="rounded-full gap-2 border-primary/20 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="h-4 w-4" /> Share
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="rounded-full gap-2 border-primary/20 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30"
                                            onClick={toggleMute}
                                        >
                                            {isMuted ? (
                                                <><VolumeX className="h-4 w-4" /> Unmute</>
                                            ) : (
                                                <><Volume2 className="h-4 w-4" /> Mute</>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Description in a stylish card */}
                                <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                        <span>About this track</span>
                                    </h3>
                                    <ScrollArea className="h-32 pr-4">
                                        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                            {videoDetails?.description || "No description available for this track."}
                                        </p>
                                    </ScrollArea>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sidebar with Up Next and Queue */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Up Next */}
                        <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
                            <div className="p-4 border-b border-border/50 bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ListMusic className="h-3 w-3 text-primary" />
                                        </div>
                                        <span>Recommended Tracks</span>
                                    </h3>
                                    <Button variant="ghost" size="sm" className="text-xs h-8 rounded-full">
                                        Autoplay
                                    </Button>
                                </div>
                            </div>

                            <div className="p-3">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="flex gap-3 mb-3 p-2">
                                            <Skeleton className="h-16 w-16 rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-full rounded-md" />
                                                <Skeleton className="h-3 w-2/3 rounded-md" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <ScrollArea className="h-[500px]">
                                        {relatedVideos.map((video, index) => (
                                            <div
                                                key={video.id}
                                                className="flex gap-3 mb-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/dashboard/player?v=${video.id}`)}
                                            >
                                                <div className="flex-shrink-0 relative">
                                                    <div className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center z-10">
                                                        {index + 1}
                                                    </div>
                                                    <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                                                        <img
                                                            src={video.thumbnail}
                                                            alt={video.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Play className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 relative">
                                                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {video.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                                        {video.channelTitle}
                                                    </p>

                                                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddToQueue({
                                                                    id: video.id,
                                                                    title: video.title,
                                                                    channelTitle: video.channelTitle,
                                                                    thumbnail: video.thumbnail
                                                                });
                                                            }}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Add to playlist functionality would go here
                                                            }}
                                                        >
                                                            <Bookmark className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {relatedVideos.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                    <ListMusic className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-base font-medium mb-1">No recommendations found</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    We couldn't find any similar tracks at the moment
                                                </p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                )}
                            </div>
                        </div>

                        {/* Current Queue */}
                        {queue && queue.length > 0 && (
                            <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
                                <div className="p-4 border-b border-border/50 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Clock className="h-3 w-3 text-primary" />
                                            </div>
                                            <span>Your Queue</span>
                                        </h3>
                                        <Badge variant="outline" className="rounded-full px-3">
                                            {queue.length} tracks
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <ScrollArea className="h-[300px]">
                                        {queue.map((track, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 mb-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                            >
                                                <div className="flex-shrink-0 relative">
                                                    <div className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-primary/80 text-[10px] font-medium text-white flex items-center justify-center z-10">
                                                        {index + 1}
                                                    </div>
                                                    <div className="relative h-14 w-14 rounded-lg overflow-hidden">
                                                        <img
                                                            src={track.thumbnail}
                                                            alt={track.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-7 w-7 rounded-full bg-white/20 text-white hover:bg-white/30"
                                                                onClick={() => onPlayPause(track)}
                                                            >
                                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 relative">
                                                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {track.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {track.channelTitle}
                                                    </p>

                                                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Remove from queue functionality
                                                                if (typeof handleRemoveFromQueue === 'function') {
                                                                    handleRemoveFromQueue(index);
                                                                }
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            </div>
                        )}

                        {/* Recently Played Section */}
                        {!loading && recentlyPlayed && recentlyPlayed.length > 0 && (
                            <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
                                <div className="p-4 border-b border-border/50 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <History className="h-3 w-3 text-primary" />
                                            </div>
                                            <span>Recently Played</span>
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-3">
                                    <ScrollArea className="h-[200px]">
                                        {recentlyPlayed.map((track, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 mb-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/dashboard/player?v=${track.videoId}`)}
                                            >
                                                <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={track.thumbnail}
                                                        alt={track.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Play className="h-5 w-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-xs line-clamp-1 group-hover:text-primary transition-colors">
                                                        {track.title}
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground truncate">
                                                        {track.channelTitle}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
