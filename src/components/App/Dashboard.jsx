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
    // Add this near the top of your component, after the useState declarations
    const [featuredArtist, setFeaturedArtist] = useState(null);

    // Complete useEffect to fetch and select a daily featured OPM artist with improved API key rotation
    useEffect(() => {
        const fetchFeaturedArtist = async () => {
            // List of OPM artists to search for
            const opmArtists = [
                "Cup of Joe",
                "Dionela",
                "Ben&Ben",
                "Moira Dela Torre",
                "December Avenue",
                "SB19",
                "Zack Tabudlo",
                "Arthur Nery",
                "Juan Karlos",
                "Adie",
                "Nobita",
                "Munimuni",
                "The Juans",
                "BINI",
                "Alamat"
            ];

            // Use the current date to select an artist (changes daily)
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const artistIndex = dayOfYear % opmArtists.length;
            const selectedArtist = opmArtists[artistIndex];

            // Attempt to fetch with multiple API keys if needed
            let attempts = 0;
            let videoData = null;
            let videoId = null;

            while (attempts < 13 && !videoData) { // 13 is the number of API keys we have
                try {
                    // Get API key from the YouTube API configuration
                    const apiKey = getYoutubeApiKey();

                    // Search for the artist's most popular video
                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(selectedArtist + " official music video")}&type=video&maxResults=1&order=viewCount&regionCode=PH&relevanceLanguage=tl&videoCategoryId=10&key=${apiKey}`
                    );

                    if (!response.ok) {
                        // If we hit API quota, rotate to next key
                        if (response.status === 403) {
                            rotateApiKey();
                            attempts++;
                            console.log(`API quota exceeded, rotated to next key. Attempt ${attempts}/13`);
                            continue; // Try with the next key
                        }
                        throw new Error(`Network response was not ok: ${response.status}`);
                    }

                    const searchData = await response.json();

                    if (searchData.items && searchData.items.length > 0) {
                        videoId = searchData.items[0].id.videoId;

                        // Get video details to get view count and better quality thumbnail
                        const videoResponse = await fetch(
                            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
                        );

                        if (!videoResponse.ok) {
                            if (videoResponse.status === 403) {
                                rotateApiKey();
                                attempts++;
                                console.log(`API quota exceeded, rotated to next key. Attempt ${attempts}/13`);
                                continue; // Try with the next key
                            }
                            throw new Error(`Video details response was not ok: ${videoResponse.status}`);
                        }

                        const videoDataResponse = await videoResponse.json();

                        if (videoDataResponse.items && videoDataResponse.items.length > 0) {
                            videoData = videoDataResponse;
                            break; // Success! Exit the loop
                        }
                    }

                    // If we get here without valid data, try the next key
                    rotateApiKey();
                    attempts++;

                } catch (error) {
                    console.error(`Error fetching featured OPM artist (attempt ${attempts}/13):`, error);
                    rotateApiKey();
                    attempts++;
                }
            }

            // Process the video data if we got it
            if (videoData && videoData.items && videoData.items.length > 0) {
                const videoDetails = videoData.items[0];
                const fullTitle = videoDetails.snippet.title;

                // Try to extract song title from common formats like "Artist - Song" or "Song by Artist"
                let songTitle = fullTitle;
                let artistName = selectedArtist;

                // Try to parse "Artist - Song" format
                if (fullTitle.includes(' - ')) {
                    const parts = fullTitle.split(' - ');
                    // If the video is uploaded by the artist, the title might be "Song - Artist"
                    // or "Artist - Song" so we need to check which part contains the artist name
                    if (parts[0].toLowerCase().includes(selectedArtist.toLowerCase())) {
                        artistName = parts[0].trim();
                        songTitle = parts[1].trim();
                    } else {
                        songTitle = parts[0].trim();
                        artistName = parts[1].trim();
                    }
                }
                // Try to parse "Song by Artist" format
                else if (fullTitle.toLowerCase().includes(' by ')) {
                    const parts = fullTitle.split(' by ');
                    songTitle = parts[0].trim();
                    artistName = parts[1].trim();
                }
                // Try to parse "Song (Official Music Video)" format
                else if (fullTitle.includes('(') && fullTitle.includes(')')) {
                    songTitle = fullTitle.split('(')[0].trim();
                }

                // Clean up song title by removing common suffixes
                const suffixesToRemove = [
                    '(Official Music Video)',
                    '(Official Video)',
                    '(Music Video)',
                    '(Lyric Video)',
                    '(Official Lyric Video)',
                    '(Official Audio)',
                    '(Audio)',
                    '[Official Music Video]',
                    '[Official Video]',
                    '[Music Video]',
                    '[Lyric Video]',
                    '[Official Lyric Video]',
                    '[Official Audio]',
                    '[Audio]'
                ];

                for (const suffix of suffixesToRemove) {
                    if (songTitle.includes(suffix)) {
                        songTitle = songTitle.replace(suffix, '').trim();
                    }
                }

                // Set the featured artist with parsed data
                setFeaturedArtist({
                    name: selectedArtist,
                    videoId: videoId,
                    title: fullTitle,
                    songTitle: songTitle,
                    artistName: artistName,
                    channelTitle: videoDetails.snippet.channelTitle,
                    thumbnail: videoDetails.snippet.thumbnails.maxres?.url ||
                        videoDetails.snippet.thumbnails.high?.url ||
                        videoDetails.snippet.thumbnails.medium?.url ||
                        videoDetails.snippet.thumbnails.default?.url,
                    viewCount: parseInt(videoDetails.statistics.viewCount).toLocaleString()
                });
            } else {
                // Fallback to a default OPM artist if all API attempts fail
                console.log("All API attempts failed, using fallback artist data");
                setFeaturedArtist({
                    name: "Ben&Ben",
                    videoId: "PFtEP2aYi9A",
                    title: "Ben&Ben - Kathang Isip (Official Music Video)",
                    songTitle: "Kathang Isip",
                    artistName: "Ben&Ben",
                    channelTitle: "Ben&Ben",
                    thumbnail: "https://i.ytimg.com/vi/PFtEP2aYi9A/maxresdefault.jpg",
                    viewCount: "15M"
                });
            }
        };

        fetchFeaturedArtist();
    }, []);

    // Fetch trending Filipino music videos from YouTube API
    useEffect(() => {
        const fetchTrendingMusic = async () => {
            // List of popular Filipino artists to search for
            const filipinoArtists = [
                "BINI",
                "SB19",
                "Ben&Ben",
                "Moira Dela Torre",
                "December Avenue",
                "Zack Tabudlo",
                "Arthur Nery",
                "Juan Karlos",
                "Adie",
                "Nobita",
                "Cup of Joe",
                "Dionela",
                "The Juans",
                "Alamat",
                "BGYO",
                "Sarah Geronimo",
                "KZ Tandingan",
                "Morissette Amon",
                "Darren Espanto",
                "Unique Salonga"
            ];

            let attempts = 0;
            let trendingData = null;

            while (attempts < 13 && !trendingData) { // 13 is the number of API keys we have
                try {
                    const apiKey = getYoutubeApiKey();

                    // Create a combined search for Filipino artists
                    // We'll search for each artist and combine the results
                    const promises = filipinoArtists.slice(0, 5).map(artist =>
                        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(artist + " music")}&type=video&maxResults=3&order=viewCount&regionCode=PH&relevanceLanguage=tl&videoCategoryId=10&key=${apiKey}`)
                            .then(response => {
                                if (!response.ok) {
                                    if (response.status === 403) {
                                        throw new Error('API quota exceeded');
                                    }
                                    throw new Error(`Network response was not ok: ${response.status}`);
                                }
                                return response.json();
                            })
                    );

                    // Wait for all searches to complete
                    const searchResults = await Promise.all(promises);

                    // Extract video IDs from search results
                    const videoIds = searchResults.flatMap(result =>
                        result.items ? result.items.map(item => item.id.videoId) : []
                    );

                    if (videoIds.length === 0) {
                        throw new Error('No videos found');
                    }

                    // Get detailed information for each video
                    const videoDetailsResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`
                    );

                    if (!videoDetailsResponse.ok) {
                        if (videoDetailsResponse.status === 403) {
                            rotateApiKey();
                            attempts++;
                            console.log(`API quota exceeded, rotated to next key. Attempt ${attempts}/13`);
                            continue; // Try with the next key
                        }
                        throw new Error(`Video details response was not ok: ${videoDetailsResponse.status}`);
                    }

                    trendingData = await videoDetailsResponse.json();

                    // If we got valid data, break the loop
                    if (trendingData && trendingData.items && trendingData.items.length > 0) {
                        break;
                    }

                    // If we get here without valid data, try the next key
                    rotateApiKey();
                    attempts++;

                } catch (error) {
                    console.error(`Error fetching trending Filipino music (attempt ${attempts}/13):`, error);
                    rotateApiKey();
                    attempts++;
                }
            }

            // Process the video data if we got it
            if (trendingData && trendingData.items && trendingData.items.length > 0) {
                // Sort by view count to get the most popular videos
                const sortedItems = [...trendingData.items].sort((a, b) =>
                    parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount)
                );

                // Format the tracks data
                const formattedTracks = sortedItems.map(item => {
                    // Extract clean song title
                    let title = item.snippet.title;
                    const suffixesToRemove = [
                        '(Official Music Video)',
                        '(Official Video)',
                        '(Music Video)',
                        '(Lyric Video)',
                        '(Official Lyric Video)',
                        '(Official Audio)',
                        '(Audio)',
                        '[Official Music Video]',
                        '[Official Video]',
                        '[Music Video]',
                        '[Lyric Video]',
                        '[Official Lyric Video]',
                        '[Official Audio]',
                        '[Audio]'
                    ];

                    for (const suffix of suffixesToRemove) {
                        if (title.includes(suffix)) {
                            title = title.replace(suffix, '').trim();
                        }
                    }

                    return {
                        id: item.id,
                        title: title,
                        originalTitle: item.snippet.title,
                        channelTitle: item.snippet.channelTitle,
                        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
                        viewCount: parseInt(item.statistics.viewCount).toLocaleString(),
                        publishedAt: new Date(item.snippet.publishedAt)
                    };
                });

                setTrendingTracks(formattedTracks);
            } else {
                // Fallback to default data if all API attempts fail
                console.log("All API attempts failed for trending music, using fallback data");
                const fallbackTracks = [
                    {
                        id: "PFtEP2aYi9A",
                        title: "Kathang Isip",
                        channelTitle: "Ben&Ben",
                        thumbnail: "https://i.ytimg.com/vi/PFtEP2aYi9A/maxresdefault.jpg",
                        viewCount: "15M",
                        publishedAt: new Date("2018-05-30")
                    },
                    {
                        id: "0XktQCjx0VE",
                        title: "Tagpuan",
                        channelTitle: "Moira Dela Torre",
                        thumbnail: "https://i.ytimg.com/vi/0XktQCjx0VE/maxresdefault.jpg",
                        viewCount: "25M",
                        publishedAt: new Date("2018-01-15")
                    },
                    {
                        id: "JnQIHs_UT-Q",
                        title: "Kung 'Di Rin Lang Ikaw",
                        channelTitle: "December Avenue",
                        thumbnail: "https://i.ytimg.com/vi/JnQIHs_UT-Q/maxresdefault.jpg",
                        viewCount: "18M",
                        publishedAt: new Date("2017-11-20")
                    },
                    {
                        id: "Vrd8uDWRmx0",
                        title: "Wannabe",
                        channelTitle: "Cup of Joe",
                        thumbnail: "https://i.ytimg.com/vi/Vrd8uDWRmx0/maxresdefault.jpg",
                        viewCount: "1.2M",
                        publishedAt: new Date("2021-05-10")
                    },
                    {
                        id: "Qz4GcVxWU7Y",
                        title: "Paalam",
                        channelTitle: "Dionela",
                        thumbnail: "https://i.ytimg.com/vi/Qz4GcVxWU7Y/maxresdefault.jpg",
                        viewCount: "3.5M",
                        publishedAt: new Date("2020-08-15")
                    }
                ];
                setTrendingTracks(fallbackTracks);
            }
        };

        fetchTrendingMusic();
    }, []);

    // Fetch new releases from Filipino artists
    useEffect(() => {
        const fetchNewReleases = async () => {
            // List of popular Filipino artists/bands to search for
            const filipinoArtists = [
                "BINI",
                "SB19",
                "Ben&Ben",
                "Moira Dela Torre",
                "December Avenue",
                "Zack Tabudlo",
                "Arthur Nery",
                "Juan Karlos",
                "Adie",
                "BGYO",
                "Sarah Geronimo",
                "KZ Tandingan",
                "Morissette Amon",
                "Alamat",
                "P-Pop"
            ];

            let attempts = 0;
            let releasesData = null;

            while (attempts < 13 && !releasesData) { // 13 is the number of API keys we have
                try {
                    const apiKey = getYoutubeApiKey();
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    const publishedAfter = oneMonthAgo.toISOString();

                    // Randomly select 3 artists to search for to get a variety of results
                    const selectedArtists = filipinoArtists
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3)
                        .join(" OR ");

                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=8&order=date&publishedAfter=${publishedAfter}&q=${encodeURIComponent(selectedArtists)}&regionCode=PH&relevanceLanguage=tl&key=${apiKey}`
                    );

                    if (!response.ok) {
                        if (response.status === 403) {
                            rotateApiKey();
                            attempts++;
                            console.log(`API quota exceeded, rotated to next key. Attempt ${attempts}/13`);
                            continue; // Try with the next key
                        }
                        throw new Error(`Network response was not ok: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data.items && data.items.length > 0) {
                        releasesData = data;
                        break; // Success! Exit the loop
                    }

                    // If we get here without valid data, try the next key
                    rotateApiKey();
                    attempts++;

                } catch (error) {
                    console.error(`Error fetching new releases (attempt ${attempts}/13):`, error);
                    rotateApiKey();
                    attempts++;
                }
            }

            if (releasesData && releasesData.items && releasesData.items.length > 0) {
                // Get additional details for each video to get better thumbnails and view counts
                try {
                    const apiKey = getYoutubeApiKey();
                    const videoIds = releasesData.items.map(item => item.id.videoId).join(',');

                    const videoDetailsResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
                    );

                    if (videoDetailsResponse.ok) {
                        const videoDetailsData = await videoDetailsResponse.json();

                        if (videoDetailsData.items && videoDetailsData.items.length > 0) {
                            // Create a map of video details by ID for easy lookup
                            const videoDetailsMap = {};
                            videoDetailsData.items.forEach(item => {
                                videoDetailsMap[item.id] = item;
                            });

                            // Format the releases with enhanced data
                            const formattedReleases = releasesData.items.map(item => {
                                const videoId = item.id.videoId;
                                const videoDetails = videoDetailsMap[videoId];

                                // Clean up title by removing common suffixes
                                let title = item.snippet.title;
                                const suffixesToRemove = [
                                    '(Official Music Video)',
                                    '(Official Video)',
                                    '(Music Video)',
                                    '(Lyric Video)',
                                    '(Official Lyric Video)',
                                    '(Official Audio)',
                                    '(Audio)',
                                    '[Official Music Video]',
                                    '[Official Video]',
                                    '[Music Video]',
                                    '[Lyric Video]',
                                    '[Official Lyric Video]',
                                    '[Official Audio]',
                                    '[Audio]'
                                ];

                                for (const suffix of suffixesToRemove) {
                                    if (title.includes(suffix)) {
                                        title = title.replace(suffix, '').trim();
                                    }
                                }

                                return {
                                    id: videoId,
                                    title: title,
                                    originalTitle: item.snippet.title,
                                    channelTitle: item.snippet.channelTitle,
                                    thumbnail: videoDetails ?
                                        (videoDetails.snippet.thumbnails.maxres?.url ||
                                            videoDetails.snippet.thumbnails.high?.url ||
                                            item.snippet.thumbnails.high?.url) :
                                        item.snippet.thumbnails.high?.url,
                                    publishedAt: new Date(item.snippet.publishedAt),
                                    viewCount: videoDetails ?
                                        parseInt(videoDetails.statistics.viewCount).toLocaleString() :
                                        "N/A"
                                };
                            });

                            setNewReleases(formattedReleases);
                        }
                    }
                } catch (detailsError) {
                    console.error("Error fetching video details:", detailsError);

                    // If details fetch fails, still use the basic data
                    const formattedReleases = releasesData.items.map(item => ({
                        id: item.id.videoId,
                        title: item.snippet.title,
                        channelTitle: item.snippet.channelTitle,
                        thumbnail: item.snippet.thumbnails.high?.url,
                        publishedAt: new Date(item.snippet.publishedAt)
                    }));

                    setNewReleases(formattedReleases);
                }
            } else {
                // Fallback to static data if all API attempts fail
                console.log("All API attempts failed, using fallback new releases data");
                const fallbackReleases = [
                    {
                        id: "Qz4GcVxWU7Y",
                        title: "Paalam",
                        channelTitle: "Dionela",
                        thumbnail: "https://i.ytimg.com/vi/Qz4GcVxWU7Y/maxresdefault.jpg",
                        publishedAt: new Date(new Date().setDate(new Date().getDate() - 5)),
                        viewCount: "3.5M"
                    },
                    {
                        id: "PFtEP2aYi9A",
                        title: "Kathang Isip",
                        channelTitle: "Ben&Ben",
                        thumbnail: "https://i.ytimg.com/vi/PFtEP2aYi9A/maxresdefault.jpg",
                        publishedAt: new Date(new Date().setDate(new Date().getDate() - 8)),
                        viewCount: "15M"
                    },
                    {
                        id: "0XktQCjx0VE",
                        title: "Tagpuan",
                        channelTitle: "Moira Dela Torre",
                        thumbnail: "https://i.ytimg.com/vi/0XktQCjx0VE/maxresdefault.jpg",
                        publishedAt: new Date(new Date().setDate(new Date().getDate() - 12)),
                        viewCount: "25M"
                    },
                    {
                        id: "JnQIHs_UT-Q",
                        title: "Kung 'Di Rin Lang Ikaw",
                        channelTitle: "December Avenue",
                        thumbnail: "https://i.ytimg.com/vi/JnQIHs_UT-Q/maxresdefault.jpg",
                        publishedAt: new Date(new Date().setDate(new Date().getDate() - 15)),
                        viewCount: "18M"
                    }
                ];

                setNewReleases(fallbackReleases);
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


    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
            <div className="container mx-auto px-4 py-6">

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Featured Section */}
                    {loading || !featuredArtist ? (
                        <Skeleton className="w-full h-[300px] rounded-xl" />
                    ) : (
                        <div className="relative overflow-hidden rounded-xl h-[300px] group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
                            <img
                                src={featuredArtist.thumbnail || "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"}
                                alt="Featured OPM Artist"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col items-start">
                                <Badge className="bg-primary/80 hover:bg-primary mb-3">OPM Featured Artist: {featuredArtist.name}</Badge>
                                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                                    {featuredArtist.songTitle || featuredArtist.title}
                                </h2>
                                <p className="text-white/80 mb-4">
                                    {featuredArtist.artistName || featuredArtist.channelTitle} • {featuredArtist.viewCount} views
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        className="gap-2 bg-white text-primary hover:bg-white/90"
                                        onClick={() => navigate(`/dashboard/player?v=${featuredArtist.videoId}`)}
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
                                New OPM Releases
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
                                            <Badge className="absolute top-2 right-2 bg-primary/80 hover:bg-primary">New OPM</Badge>
                                        </div>
                                        <CardContent className="p-3">
                                            <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{release.title}</h3>
                                            <p className="text-sm text-muted-foreground">{release.channelTitle}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDistanceToNow(release.publishedAt, { addSuffix: true })}
                                                </Badge>
                                                {release.viewCount && release.viewCount !== "N/A" && (
                                                    <span className="text-xs text-muted-foreground">{release.viewCount} views</span>
                                                )}
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
