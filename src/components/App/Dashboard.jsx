import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import { cn } from '@/lib/utils';
import { db } from '@/config/firebase';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Music2, Users, Heart, Headphones, Play, Pause, BarChart3, Clock,
    TrendingUp, ListMusic, Calendar, Activity, Disc, Radio,
    Sparkles, Award, Zap, Bookmark, PlusCircle, ChevronRight, Search,
    Shuffle, SkipBack, SkipForward, Volume2, Maximize2, Mic, Layers
} from "lucide-react";

const Dashboard = ({ currentUser, currentTrack, isPlayerPage, onPlayPause, queue }) => {
    const navigate = useNavigate();
    const [trendingTracks, setTrendingTracks] = useState([]);
    const [newReleases, setNewReleases] = useState([]);
    const [genres, setGenres] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    // Fetch trending music videos from YouTube API
    useEffect(() => {
        const fetchTrendingMusic = async () => {
            try {
                const apiKey = getYoutubeApiKey();
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=10&key=${apiKey}`
                );

                if (!response.ok) {
                    // If we hit API quota, rotate to next key
                    if (response.status === 403) {
                        rotateApiKey();
                        return;
                    }
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const formattedTracks = data.items.map(item => ({
                    id: item.id,
                    title: item.snippet.title,
                    channelTitle: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.high.url,
                    viewCount: parseInt(item.statistics.viewCount).toLocaleString(),
                    publishedAt: new Date(item.snippet.publishedAt)
                }));

                setTrendingTracks(formattedTracks);
            } catch (error) {
                console.error("Error fetching trending music:", error);
            }
        };

        fetchTrendingMusic();
    }, []);

    // Fetch new releases (recent music uploads)
    useEffect(() => {
        const fetchNewReleases = async () => {
            try {
                const apiKey = getYoutubeApiKey();
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const publishedAfter = oneMonthAgo.toISOString();

                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=8&order=date&publishedAfter=${publishedAfter}&key=${apiKey}`
                );

                if (!response.ok) {
                    if (response.status === 403) {
                        rotateApiKey();
                        return;
                    }
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const formattedReleases = data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    channelTitle: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.high.url,
                    publishedAt: new Date(item.snippet.publishedAt)
                }));

                setNewReleases(formattedReleases);
            } catch (error) {
                console.error("Error fetching new releases:", error);
            }
        };

        fetchNewReleases();
    }, []);

    // Mock data for genres
    useEffect(() => {
        const genreData = [
            { id: 1, name: "Pop", color: "from-pink-500 to-purple-500", icon: <Music2 className="h-6 w-6" /> },
            { id: 2, name: "Hip Hop", color: "from-blue-500 to-cyan-500", icon: <Mic className="h-6 w-6" /> },
            { id: 3, name: "Rock", color: "from-red-500 to-orange-500", icon: <Zap className="h-6 w-6" /> },
            { id: 4, name: "Electronic", color: "from-green-500 to-emerald-500", icon: <Radio className="h-6 w-6" /> },
            { id: 5, name: "R&B", color: "from-purple-500 to-indigo-500", icon: <Disc className="h-6 w-6" /> },
            { id: 6, name: "Jazz", color: "from-amber-500 to-yellow-500", icon: <Music2 className="h-6 w-6" /> },
        ];

        setGenres(genreData);
    }, []);

    // Fetch recently played tracks from Firestore
    useEffect(() => {
        const fetchRecentlyPlayed = async () => {
            if (currentUser?.uid) {
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
                        ...doc.data()
                    }));

                    setRecentlyPlayed(recentTracks);
                } catch (error) {
                    console.error("Error fetching recently played:", error);
                }
            }
        };

        fetchRecentlyPlayed();

        // Simulate loading state
        setTimeout(() => setLoading(false), 1500);
    }, [currentUser]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
            <div className="container mx-auto px-4 py-6">
                {/* Header with Search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Discover Music
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Explore trending tracks, new releases, and personalized recommendations
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search for songs, artists, or albums"
                                className="pl-10 w-full md:w-[300px] bg-background border-border"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Featured Section */}
                    {loading ? (
                        <Skeleton className="w-full h-[300px] rounded-xl" />
                    ) : (
                        <div className="relative overflow-hidden rounded-xl h-[300px] group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                            <img
                                src={trendingTracks[0]?.thumbnail || "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"}
                                alt="Featured Track"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col items-start">
                                <Badge className="bg-primary/80 hover:bg-primary mb-3">Featured Track</Badge>
                                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                                    {trendingTracks[0]?.title || "Loading featured track..."}
                                </h2>
                                <p className="text-white/80 mb-4">
                                    {trendingTracks[0]?.channelTitle || "Artist"} • {trendingTracks[0]?.viewCount || "1M"} views
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        className="gap-2 bg-white text-primary hover:bg-white/90"
                                        onClick={() => navigate(`/dashboard/player?v=${trendingTracks[0]?.id}`)}
                                    >
                                        <Play className="h-4 w-4 fill-primary" />
                                        Play Now
                                    </Button>
                                    <Button variant="outline" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        <PlusCircle className="h-4 w-4" />
                                        Add to Queue
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trending Tracks */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Trending Now
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/discover')}>
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="aspect-video rounded-lg" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                ))
                            ) : (
                                trendingTracks.slice(0, 5).map((track) => (
                                    <Card key={track.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors group">
                                        <div className="relative aspect-video">
                                            <img
                                                src={track.thumbnail}
                                                alt={track.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    size="icon"
                                                    className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform"
                                                    onClick={() => navigate(`/dashboard/video/player?v=${track.id}`)}
                                                >
                                                    <Play className="h-6 w-6 fill-current" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{track.title}</h3>
                                            <p className="text-sm text-muted-foreground">{track.channelTitle}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="secondary" className="text-xs font-normal">
                                                    {formatDistanceToNow(track.publishedAt, { addSuffix: true })}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">{track.viewCount} views</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Genre Exploration */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Layers className="h-5 w-5 text-primary" />
                                Browse by Genre
                            </h2>
                            <Button variant="ghost" size="sm">
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-32 rounded-lg" />
                                ))
                            ) : (
                                genres.map((genre) => (
                                    <Card
                                        key={genre.id}
                                        className="overflow-hidden border-border/50 hover:shadow-md transition-all cursor-pointer h-32 group"
                                        onClick={() => navigate(`/dashboard/discover?genre=${genre.name.toLowerCase()}`)}
                                    >
                                        <div className={`h-full w-full flex flex-col items-center justify-center bg-gradient-to-br ${genre.color}`}>
                                            <div className="text-white mb-2 transition-transform group-hover:scale-110">
                                                {genre.icon}
                                            </div>
                                            <h3 className="font-semibold text-white">{genre.name}</h3>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* New Releases */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                New Releases
                            </h2>
                            <Button variant="ghost" size="sm">
                                View All <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-48 rounded-lg" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                ))
                            ) : (
                                newReleases.slice(0, 4).map((release) => (
                                    <Card key={release.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors group">
                                        <div className="relative h-48">
                                            <img
                                                src={release.thumbnail}
                                                alt={release.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    size="icon"
                                                    className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform"
                                                    onClick={() => navigate(`/dashboard/player?v=${release.id}`)}
                                                >
                                                    <Play className="h-6 w-6 fill-current" />
                                                </Button>
                                            </div>
                                            <Badge className="absolute top-2 right-2 bg-primary/80 hover:bg-primary">New</Badge>
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{release.title}</h3>
                                            <p className="text-sm text-muted-foreground">{release.channelTitle}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDistanceToNow(release.publishedAt, { addSuffix: true })}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Two Column Layout for Stats and Recently Played */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recently Played */}
                        <Card className="lg:col-span-2 border-border/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        Recently Played
                                    </CardTitle>
                                    <Button variant="ghost" size="sm">
                                        View History <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2">
                                            <Skeleton className="h-12 w-12 rounded" />
                                            <div className="space-y-1 flex-1">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-3 w-2/3" />
                                            </div>
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                    ))
                                ) : recentlyPlayed.length > 0 ? (
                                    <ScrollArea className="h-[300px] pr-4">
                                        {recentlyPlayed.map((track, index) => (
                                            <div key={track.id} className="flex items-center gap-3 py-2 group hover:bg-accent/50 rounded-md px-2">
                                                <div className="font-medium text-muted-foreground w-6 text-center">{index + 1}</div>
                                                <div className="relative h-12 w-12 rounded overflow-hidden">
                                                    <img
                                                        src={track.thumbnail || "https://via.placeholder.com/48"}
                                                        alt={track.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
                                                            onClick={() => navigate(`/dashboard/player?v=${track.videoId}`)}
                                                        >
                                                            <Play className="h-4 w-4 fill-current" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{track.title}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{track.channelTitle}</p>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(track.timestamp?.toDate() || new Date(), { addSuffix: true })}
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                        <Headphones className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-medium mb-1">No listening history yet</h3>
                                        <p className="text-muted-foreground max-w-md">
                                            Start playing some tracks to see your recently played music here
                                        </p>
                                        <Button className="mt-4" onClick={() => navigate('/dashboard/discover')}>
                                            Discover Music
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats and Recommendations */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Your Music Stats
                                </CardTitle>
                                <CardDescription>
                                    Insights into your listening habits
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {loading ? (
                                    <>
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-medium">Top Genre</div>
                                                <Badge>Pop</Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span>Pop</span>
                                                    <span>45%</span>
                                                </div>
                                                <Progress value={45} className="h-2" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                <div className="text-xs text-center">
                                                    <div className="font-medium">Hip Hop</div>
                                                    <div className="text-muted-foreground">25%</div>
                                                </div>
                                                <div className="text-xs text-center">
                                                    <div className="font-medium">Rock</div>
                                                    <div className="text-muted-foreground">15%</div>
                                                </div>
                                                <div className="text-xs text-center">
                                                    <div className="font-medium">Electronic</div>
                                                    <div className="text-muted-foreground">10%</div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-medium">Listening Time</div>
                                                <Badge variant="outline">This Week</Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Headphones className="h-8 w-8 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold">12h 34m</div>
                                                    <div className="text-xs text-muted-foreground flex items-center">
                                                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                                                        <span className="text-green-500 font-medium">+15%</span> from last week
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <div className="text-sm font-medium mb-2">Recommended for You</div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 group">
                                                    <div className="relative h-10 w-10 rounded overflow-hidden">
                                                        <img
                                                            src="https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
                                                            alt="Recommended track"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Play className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-medium truncate group-hover:text-primary transition-colors">Never Gonna Give You Up</h4>
                                                        <p className="text-xs text-muted-foreground truncate">Rick Astley</p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6">
                                                        <PlusCircle className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2 group">
                                                    <div className="relative h-10 w-10 rounded overflow-hidden">
                                                        <img
                                                            src="https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg"
                                                            alt="Recommended track"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Play className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-medium truncate group-hover:text-primary transition-colors">Shape of You</h4>
                                                        <p className="text-xs text-muted-foreground truncate">Ed Sheeran</p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6">
                                                        <PlusCircle className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2 group">
                                                    <div className="relative h-10 w-10 rounded overflow-hidden">
                                                        <img
                                                            src="https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg"
                                                            alt="Recommended track"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Play className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-medium truncate group-hover:text-primary transition-colors">Despacito</h4>
                                                        <p className="text-xs text-muted-foreground truncate">Luis Fonsi</p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6">
                                                        <PlusCircle className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-8">
                                                View More Recommendations
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Now Playing Section (only show if a track is playing) */}
                    {currentTrack && (
                        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-background">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                    <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-lg overflow-hidden group">
                                        <img
                                            src={currentTrack.thumbnail || "https://via.placeholder.com/128"}
                                            alt={currentTrack.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                size="icon"
                                                className="h-12 w-12 rounded-full bg-white text-primary hover:bg-white/90"
                                                onClick={() => navigate('/dashboard/player')}
                                            >
                                                <Maximize2 className="h-6 w-6" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <Badge className="mb-2">Now Playing</Badge>
                                        <h3 className="text-xl md:text-2xl font-bold line-clamp-1">{currentTrack.title}</h3>
                                        <p className="text-muted-foreground">{currentTrack.channelTitle}</p>

                                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                                                <SkipBack className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                className="h-12 w-12 rounded-full bg-primary text-white hover:bg-primary/90"
                                                onClick={() => onPlayPause(currentTrack)}
                                            >
                                                {currentTrack.isPlaying ? (
                                                    <Pause className="h-6 w-6" />
                                                ) : (
                                                    <Play className="h-6 w-6 ml-1" />
                                                )}
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                                                <SkipForward className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center gap-4">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                            <Volume2 className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                            <Shuffle className="h-5 w-5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                                            <ListMusic className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 px-4">
                                    <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: '35%' }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>1:23</span>
                                        <span>3:45</span>
                                    </div>
                                </div>

                                {/* Queue preview */}
                                {queue && queue.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium flex items-center gap-1">
                                                <ListMusic className="h-4 w-4 text-primary" />
                                                Up Next in Queue
                                            </h4>
                                            <Button variant="link" size="sm" className="h-6 p-0" onClick={() => navigate('/dashboard/player')}>
                                                View Full Queue
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                            {queue.slice(0, 5).map((track, index) => (
                                                <div key={index} className="flex-shrink-0 w-32 group">
                                                    <div className="relative h-20 rounded overflow-hidden">
                                                        <img
                                                            src={track.thumbnail}
                                                            alt={track.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
                                                            >
                                                                <Play className="h-4 w-4 fill-current" />
                                                            </Button>
                                                        </div>
                                                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <h5 className="text-xs font-medium mt-1 truncate">{track.title}</h5>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
