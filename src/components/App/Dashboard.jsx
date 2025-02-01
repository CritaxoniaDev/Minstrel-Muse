import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';
import {
    Play, Pause, Music2, Users, Clock, Heart, Search,
    Mic2, Sparkles, Radio, Flame, Library, Plus, MoreHorizontal,
    Calendar, TrendingUp, History, Star, Loader2
} from "lucide-react";

const quickLinks = [
    { icon: Star, label: "Favorites", path: "/favorites" },
    { icon: History, label: "Recently Played", path: "/history" },
    { icon: Library, label: "Your Library", path: "/library" },
    { icon: TrendingUp, label: "Charts", path: "/charts" }
];

const Dashboard = ({ currentUser, currentTrack, isPlaying, onPlayPause }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trendingArtists, setTrendingArtists] = useState([]);
    const [featuredPlaylists, setFeaturedPlaylists] = useState([]);

    const fetchFeaturedPlaylists = async () => {
        let attempts = 0;
        while (attempts < 13) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 4,
                        key: getYoutubeApiKey(),
                        type: 'playlist',
                        q: 'music playlist hits'
                    }
                });

                const playlists = response.data.items.map(item => ({
                    id: item.id.playlistId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    coverUrl: item.snippet.thumbnails.high.url,
                    channelTitle: item.snippet.channelTitle
                }));

                setFeaturedPlaylists(playlists);
                break;
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error fetching playlists:', error);
                    break;
                }
            }
        }
    };

    // Add fetchFeaturedPlaylists to your useEffect
    useEffect(() => {
        const initializeDashboard = async () => {
            await Promise.all([
                fetchYoutubeVideos(),
                fetchTrendingArtists(),
                fetchFeaturedPlaylists()
            ]);
            setLoading(false);
        };

        initializeDashboard();
    }, []);

    const fetchTrendingArtists = async () => {
        const artistQueries = [
            'Taylor Swift official',
            'Ed Sheeran official',
            'Sarah Geronimo official',
            'KZ Tandingan official',
            'Morissette Amon official',
            'Bruno Mars official',
            'Ariana Grande official',
            'Regine Velasquez official'
        ];

        let attempts = 0;
        const allArtists = [];

        while (attempts < 13 && allArtists.length < artistQueries.length) {
            try {
                const currentQuery = artistQueries[allArtists.length];
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 1,
                        key: getYoutubeApiKey(),
                        type: 'channel',
                        q: currentQuery
                    }
                });

                if (response.data.items.length > 0) {
                    const artist = response.data.items[0];
                    allArtists.push({
                        id: artist.id.channelId,
                        name: artist.snippet.title.replace(' - Topic', '').replace(' Official', ''),
                        imageUrl: artist.snippet.thumbnails.high.url,
                        description: artist.snippet.description,
                        nationality: currentQuery.includes('Sarah') ||
                            currentQuery.includes('KZ') ||
                            currentQuery.includes('Morissette') ||
                            currentQuery.includes('Regine') ? 'Filipino' : 'American'
                    });
                }
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error fetching artists:', error);
                    break;
                }
            }
        }

        setTrendingArtists(allArtists);
    };


    useEffect(() => {
        const initializeDashboard = async () => {
            await Promise.all([fetchYoutubeVideos(), fetchTrendingArtists()]);
            setLoading(false);
        };

        initializeDashboard();
    }, []);

    const fetchYoutubeVideos = async () => {
        let attempts = 0;
        while (attempts < 13) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 10,
                        key: getYoutubeApiKey(),
                        type: 'video',
                        q: 'music hits',
                        regionCode: 'US'
                    }
                });

                const videos = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.high.url,
                    channelTitle: item.snippet.channelTitle,
                }));

                setRecentlyPlayed(videos);
                break;
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error fetching YouTube videos:', error);
                    break;
                }
            }
        }
    };

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

        Promise.all([fetchUsers(), fetchYoutubeVideos()]);
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>;
    }

    return (
        <div className="mb-10 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background/95">
            {/* Hero Section */}
            <div className="relative px-6 pt-8 pb-24 bg-gradient-to-b from-primary/30 via-purple-500/10 to-background backdrop-blur-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <Avatar className="h-24 w-24 border-4 border-white/10">
                            <AvatarImage src={currentUser?.photoURL} />
                            <AvatarFallback>
                                {currentUser?.displayName?.[0] || 'M'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">
                                Welcome back, {currentUser?.displayName || 'Music Lover'}!
                            </h1>
                            <p className="text-muted-foreground">
                                Ready to discover some great music?
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {quickLinks.map((link) => (
                            <Button
                                key={link.path}
                                variant="ghost"
                                className="h-auto py-6 flex flex-col items-center gap-2 hover:bg-primary/10"
                                onClick={() => navigate(link.path)}
                            >
                                <link.icon className="h-6 w-6" />
                                <span>{link.label}</span>
                            </Button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="px-6 -mt-16 relative z-10">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Featured Playlists */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Featured Playlists</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {featuredPlaylists.map((playlist) => (
                                <Card key={playlist.id} className="group hover:bg-primary/5 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                                            <img
                                                src={playlist.coverUrl}
                                                alt={playlist.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    className="absolute bottom-4 right-4 h-12 w-12 rounded-full"
                                                    onClick={() => onPlayPause(playlist)}
                                                >
                                                    <Play className="h-6 w-6" />
                                                </Button>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold line-clamp-2">{playlist.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            By {playlist.channelTitle}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* New Releases */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-semibold mb-4">New Releases</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {recentlyPlayed.slice(0, 4).map((track) => (
                                <Card key={track.id} className="group hover:bg-primary/5">
                                    <CardContent className="p-4">
                                        <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                                            <img
                                                src={track.thumbnail}
                                                alt={track.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute inset-0 flex items-center justify-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        className="h-12 w-12 rounded-full"
                                                        onClick={() => onPlayPause(track)}
                                                    >
                                                        {currentTrack?.id === track.id && isPlaying ? (
                                                            <Pause className="h-6 w-6" />
                                                        ) : (
                                                            <Play className="h-6 w-6" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className="h-12 w-12 rounded-full"
                                                    >
                                                        <Plus className="h-6 w-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold line-clamp-1">{track.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{track.channelTitle}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Trending Artists */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-semibold mb-4">Featured Artists</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {trendingArtists.map((artist) => (
                                <div key={artist.id} className="text-center group cursor-pointer">
                                    <Avatar className="h-32 w-32 mx-auto mb-3 group-hover:ring-2 ring-primary transition-all duration-300">
                                        <AvatarImage src={artist.imageUrl} />
                                        <AvatarFallback>{artist.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-medium line-clamp-1">{artist.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {artist.nationality} Artist
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Made For You */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-semibold mb-4">Made For You</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {recentlyPlayed.slice(4, 8).map((track) => (
                                <Card key={track.id} className="group hover:bg-primary/5">
                                    <CardContent className="p-4">
                                        <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                                            <img
                                                src={track.thumbnail}
                                                alt={track.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute bottom-4 left-4">
                                                    <h3 className="text-white font-semibold">{track.title}</h3>
                                                    <p className="text-white/80 text-sm">{track.channelTitle}</p>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    className="absolute bottom-4 right-4 h-12 w-12 rounded-full"
                                                    onClick={() => onPlayPause(track)}
                                                >
                                                    {currentTrack?.id === track.id && isPlaying ? (
                                                        <Pause className="h-6 w-6" />
                                                    ) : (
                                                        <Play className="h-6 w-6" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
