import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Sparkles, Flame, Radio, Music, Disc, Wand2, Headphones, Piano, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const TrackSkeleton = () => (
    <div className="rounded-lg overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <div className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);

const TrackCard = ({ track, onPlayPause, onAddToQueue, currentTrack, isPlaying }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl"
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
                            className="h-12 w-12 rounded-full"
                            onClick={() => onPlayPause(track)}
                        >
                            {currentTrack?.id === track.id && isPlaying ? (
                                <Pause className="h-6 w-6" />
                            ) : (
                                <Play className="h-6 w-6" />
                            )}
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-12 w-12 rounded-full"
                            onClick={() => onAddToQueue(track)}
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
        <motion.div className="p-4" whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
            <h3 className="font-semibold line-clamp-1">{track.title}</h3>
            <p className="text-sm text-muted-foreground">{track.channelTitle}</p>
        </motion.div>
    </motion.div>
);

const Discover = ({ onPlayPause, currentTrack, isPlaying, onAddToQueue }) => {
    const { toast } = useToast();
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
            className="container mx-auto px-4 py-6 pb-32"
        >
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-violet-600 p-12 mb-8"
            >
                <motion.div 
                    className="relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-5xl font-bold text-white mb-6 flex items-center gap-4">
                        Discover New Music
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Sparkles className="h-10 w-10 text-yellow-300" />
                        </motion.span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                        Explore a world of endless musical possibilities. From chart-topping hits to hidden gems,
                        your next favorite song is just a click away.
                    </p>
                </motion.div>
                
                <motion.div 
                    className="absolute right-0 top-0 w-1/2 h-full opacity-10"
                    animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                        duration: 10,
                        repeat: Infinity
                    }}
                >
                    <Radio className="w-full h-full" />
                </motion.div>
            </motion.div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-red-500" />
                        Trending Now
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <TrackSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

            <Card>
                <CardHeader>
                    <CardTitle>Browse by Genre</CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                        {genres.map((genre) => (
                            <motion.button
                                key={genre.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    px-6 py-3 rounded-full font-medium
                                    ${selectedGenre.id === genre.id 
                                        ? `bg-gradient-to-r ${genre.color} text-white shadow-lg` 
                                        : 'bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-200'}
                                    transition-all duration-300
                                `}
                                onClick={() => handleGenreChange(genre)}
                            >
                                <div className="flex items-center gap-2">
                                    <genre.icon className="h-4 w-4" />
                                    <span>{genre.name}</span>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <TrackSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
