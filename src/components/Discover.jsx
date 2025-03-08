import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Sparkles, Flame, Radio, Music, Disc, Wand2, Headphones, Piano, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from 'react-responsive';
import { Skeleton } from "@/components/ui/skeleton";
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';

const genres = [
    { id: 1, name: "Pop", query: "pop music 2024", icon: Music, color: "from-pink-500 to-rose-500" },
    { id: 2, name: "Hip Hop", query: "hip hop hits 2024", icon: Disc, color: "from-purple-500 to-indigo-500" },
    { id: 3, name: "Rock", query: "rock hits", icon: Flame, color: "from-red-500 to-orange-500" },
    { id: 4, name: "Electronic", query: "electronic music", icon: Headphones, color: "from-blue-500 to-cyan-500" },
    { id: 5, name: "Jazz", query: "jazz music", icon: Music, color: "from-amber-500 to-yellow-500" },
    { id: 6, name: "Classical", query: "classical music", icon: Piano, color: "from-emerald-500 to-teal-500" }
];

const TrackSkeleton = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });

    return (
        <div className="rounded-lg overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <Skeleton className={`${isMobile ? 'h-3' : 'h-4'} w-3/4 mb-2`} />
                <Skeleton className={`${isMobile ? 'h-2' : 'h-3'} w-1/2`} />
            </div>
        </div>
    );
};


const TrackCard = ({ track, onPlayPause, onAddToQueue, currentTrack, isPlaying }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-sm bg-white dark:bg-gray-800 shadow-xl"
        >
            <div className="aspect-video relative">
                <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                size="icon"
                                className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full`}
                                onClick={() => onPlayPause(track)}
                            >
                                {currentTrack?.id === track.id && isPlaying ? (
                                    <Pause className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                                ) : (
                                    <Play className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                                )}
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                size="icon"
                                variant="secondary"
                                className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full`}
                                onClick={() => onAddToQueue(track)}
                            >
                                <Plus className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
            <motion.div
                className={`${isMobile ? 'p-3' : 'p-4'}`}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
            >
                <h3 className={`font-semibold line-clamp-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {track.title}
                </h3>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    {track.channelTitle}
                </p>
            </motion.div>
        </motion.div>
    );
};

const Discover = ({ onPlayPause, currentTrack, isPlaying, onAddToQueue }) => {
    const { toast } = useToast();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const [trendingTracks, setTrendingTracks] = useState([]);
    const [genreTracks, setGenreTracks] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(genres[0]);
    const [loading, setLoading] = useState(false);

    const fetchTracks = async (query) => {
        setLoading(true);
        let attempts = 0;
        while (attempts < 13) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 10,
                        key: getYoutubeApiKey(),
                        type: 'video',
                        q: query,
                        videoCategoryId: '10'
                    }
                });

                const videos = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.high.url,
                    channelTitle: item.snippet.channelTitle,
                }));

                setLoading(false);
                return videos;
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    toast({
                        title: "Error fetching tracks",
                        description: "Please try again later",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return [];
                }
            }
        }
        setLoading(false);
        return [];
    };

    useEffect(() => {
        const loadInitialTracks = async () => {
            const [trending, genre] = await Promise.all([
                fetchTracks('trending music 2024'),
                fetchTracks(selectedGenre.query)
            ]);
            setTrendingTracks(trending);
            setGenreTracks(genre);
        };

        loadInitialTracks();
    }, []);

    const handleGenreChange = async (genre) => {
        setSelectedGenre(genre);
        const tracks = await fetchTracks(genre.query);
        setGenreTracks(tracks);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto px-2 md:px-4 py-4 md:py-6 pb-24 md:pb-32"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-sm md:rounded-sm bg-gradient-to-r from-purple-600 via-blue-600 to-violet-600 p-6 md:p-12 mb-4 md:mb-8"
            >
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <div className="absolute -inset-[100px] bg-gradient-radial from-white/10 via-transparent to-transparent blur-xl" />

                <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-4 drop-shadow-lg`}>
                        Discover New Music
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles className={`${isMobile ? 'h-6 w-6' : 'h-10 w-10'} text-yellow-300 drop-shadow-glow`} />
                        </motion.span>
                    </h1>
                    <p className={`${isMobile ? 'text-base' : 'text-xl'} text-white/90 max-w-2xl leading-relaxed drop-shadow`}>
                        Explore a world of endless musical possibilities. From chart-topping hits to hidden gems,
                        your next favorite song is just a click away.
                    </p>
                </motion.div>

                <motion.div
                    className={`absolute right-0 top-0 ${isMobile ? 'w-1/3' : 'w-1/2'} h-full opacity-10`}
                    animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity
                    }}
                >
                    <Radio className="w-full h-full filter blur-sm" />
                </motion.div>
            </motion.div>

            <Card className="mb-4 md:mb-8 rounded-sm border border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
                <CardHeader className={`${isMobile ? 'p-4' : 'p-6'} border-b border-border/10`}>
                    <CardTitle className="flex items-center gap-2">
                        <Flame className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-500 animate-pulse`} />
                        Trending Now
                    </CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {[...Array(8)].map((_, i) => (
                                <TrackSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            <AnimatePresence mode="popLayout">
                                {trendingTracks.map((track) => (
                                    <TrackCard
                                        key={track.id}
                                        track={track}
                                        onPlayPause={onPlayPause}
                                        onAddToQueue={onAddToQueue}
                                        currentTrack={currentTrack}
                                        isPlaying={isPlaying}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-sm border border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
                <CardHeader className={`${isMobile ? 'p-4' : 'p-6'} border-b border-border/10`}>
                    <CardTitle>Browse by Genre</CardTitle>
                </CardHeader>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    <motion.div className="flex gap-2 overflow-x-auto pb-4 mb-4 md:mb-6 scrollbar-hide">
                        {genres.map((genre) => (
                            <motion.button
                                key={genre.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'}
                                    rounded-full font-medium whitespace-nowrap
                                    ${selectedGenre.id === genre.id
                                        ? `bg-gradient-to-r ${genre.color} text-white shadow-lg backdrop-blur-sm`
                                        : 'bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-200 backdrop-blur-sm'}
                                    transition-all duration-300 border border-border/20
                                `}
                                onClick={() => handleGenreChange(genre)}
                            >
                                <div className="flex items-center gap-2">
                                    <genre.icon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                                    <span>{genre.name}</span>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            {[...Array(8)].map((_, i) => (
                                <TrackSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                            <AnimatePresence mode="popLayout">
                                {genreTracks.map((track) => (
                                    <TrackCard
                                        key={track.id}
                                        track={track}
                                        onPlayPause={onPlayPause}
                                        onAddToQueue={onAddToQueue}
                                        currentTrack={currentTrack}
                                        isPlaying={isPlaying}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default Discover;
