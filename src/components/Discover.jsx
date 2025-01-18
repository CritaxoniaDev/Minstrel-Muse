import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Plus, Sparkles, Flame, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';

const genres = [
    { id: 1, name: "Pop", query: "pop music 2024" },
    { id: 2, name: "Hip Hop", query: "hip hop hits 2024" },
    { id: 3, name: "Rock", query: "rock hits" },
    { id: 4, name: "Electronic", query: "electronic music" },
    { id: 5, name: "Jazz", query: "jazz music" },
    { id: 6, name: "Classical", query: "classical music" }
];

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
                        q: query
                    }
                });

                const videos = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.high.url,
                    channelTitle: item.snippet.channelTitle,
                }));

                return videos;
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error fetching videos:', error);
                    break;
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        const initializeTracks = async () => {
            const trending = await fetchTracks('trending music 2024');
            setTrendingTracks(trending);
            
            const genreMusic = await fetchTracks(selectedGenre.query);
            setGenreTracks(genreMusic);
        };

        initializeTracks();
    }, []);

    const handleGenreChange = async (genre) => {
        setSelectedGenre(genre);
        const tracks = await fetchTracks(genre.query);
        setGenreTracks(tracks);
    };

    return (
        <div className="container mx-auto px-4 py-6 pb-32">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 mb-8">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Discover New Music
                        <Sparkles className="inline-block ml-2 h-8 w-8 animate-pulse" />
                    </h1>
                    <p className="text-white/80 max-w-xl">
                        Explore trending tracks, discover new artists, and find your next favorite song.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
                    <Radio className="w-full h-full" />
                </div>
            </div>

            {/* Trending Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-red-500" />
                        Trending Now
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {trendingTracks.map((track) => (
                            <div
                                key={track.id}
                                className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="aspect-video relative">
                                    <img
                                        src={track.thumbnail}
                                        alt={track.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                className="h-10 w-10 rounded-full"
                                                onClick={() => onPlayPause(track)}
                                            >
                                                {currentTrack?.id === track.id && isPlaying ? (
                                                    <Pause className="h-5 w-5" />
                                                ) : (
                                                    <Play className="h-5 w-5" />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-10 w-10 rounded-full"
                                                onClick={() => onAddToQueue(track)}
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold line-clamp-1">{track.title}</h3>
                                    <p className="text-sm text-muted-foreground">{track.channelTitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Genres Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Browse by Genre</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                        {genres.map((genre) => (
                            <Button
                                key={genre.id}
                                variant={selectedGenre.id === genre.id ? "default" : "outline"}
                                onClick={() => handleGenreChange(genre)}
                                className="rounded-full"
                            >
                                {genre.name}
                            </Button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {genreTracks.map((track) => (
                            <div
                                key={track.id}
                                className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="aspect-video relative">
                                    <img
                                        src={track.thumbnail}
                                        alt={track.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                className="h-10 w-10 rounded-full"
                                                onClick={() => onPlayPause(track)}
                                            >
                                                {currentTrack?.id === track.id && isPlaying ? (
                                                    <Pause className="h-5 w-5" />
                                                ) : (
                                                    <Play className="h-5 w-5" />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-10 w-10 rounded-full"
                                                onClick={() => onAddToQueue(track)}
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold line-clamp-1">{track.title}</h3>
                                    <p className="text-sm text-muted-foreground">{track.channelTitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Discover;
