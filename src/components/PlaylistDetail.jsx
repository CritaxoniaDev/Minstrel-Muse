import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Play, Pause, X, Music2 } from "lucide-react";
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '../config/youtube-api';
import { useToast } from "../hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { Slider } from "./ui/slider";
import { ArrowUpDown } from "lucide-react";

const PlaylistDetail = ({ user, onPlayPause, currentTrack, isPlaying }) => {
    const { toast } = useToast();
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchPlaylist = async () => {
            const docRef = doc(db, "playlists", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const playlistData = { id: docSnap.id, ...docSnap.data() };
                setPlaylist(playlistData);
                // Set isOwner based on playlist ownership
                setIsOwner(playlistData.userId === user?.uid);
            }
        };

        fetchPlaylist();
    }, [id, user]);

    useEffect(() => {
        const fetchPlaylist = async () => {
            const docRef = doc(db, "playlists", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPlaylist({ id: docSnap.id, ...docSnap.data() });
            }
        };

        fetchPlaylist();
    }, [id]);

    const handleReorderTrack = async (trackId, newIndex) => {
        const oldIndex = playlist.tracks.findIndex(t => t.id === trackId);
        const newTracks = [...playlist.tracks];
        const [movedTrack] = newTracks.splice(oldIndex, 1);
        newTracks.splice(newIndex, 0, movedTrack);

        try {
            const playlistRef = doc(db, "playlists", id);
            await updateDoc(playlistRef, {
                tracks: newTracks
            });

            setPlaylist(prev => ({
                ...prev,
                tracks: newTracks
            }));

            toast({
                title: "Track Reordered",
                description: `Moved to position ${newIndex + 1}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to reorder track",
                variant: "destructive",
            });
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        let attempts = 0;
        while (attempts < 13) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 10,
                        key: getYoutubeApiKey(),
                        type: 'video',
                        q: searchQuery
                    }
                });

                const videos = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.default.url,
                    channelTitle: item.snippet.channelTitle,
                }));

                setSearchResults(videos);
                break;

            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error searching videos:', error);
                    toast({
                        title: "Error",
                        description: "Failed to search videos",
                        variant: "destructive",
                    });
                    break;
                }
            }
        }
    };

    const handleAddToPlaylist = async (video) => {
        try {
            const playlistRef = doc(db, "playlists", id);
            await updateDoc(playlistRef, {
                tracks: arrayUnion(video)
            });

            setPlaylist(prev => ({
                ...prev,
                tracks: [...(prev.tracks || []), video]
            }));

            toast({
                title: "Success",
                description: "Track added to playlist",
            });
        } catch (error) {
            console.error('Error adding track to playlist:', error);
            toast({
                title: "Error",
                description: "Failed to add track",
                variant: "destructive",
            });
        }
    };

    const handlePlayTrack = (track) => {
        const trackIndex = playlist.tracks.findIndex(t => t.id === track.id);
        const remainingTracks = playlist.tracks.slice(trackIndex + 1);
        onPlayPause(track, remainingTracks);

        toast({
            title: "Now Playing",
            description: `Playing ${track.title} from ${playlist.name}`,
        });
    };

    const handleDeleteTrack = async (trackToDelete) => {
        try {
            const playlistRef = doc(db, "playlists", id);
            const updatedTracks = playlist.tracks.filter(track => track.id !== trackToDelete.id);

            await updateDoc(playlistRef, {
                tracks: updatedTracks
            });

            setPlaylist(prev => ({
                ...prev,
                tracks: updatedTracks
            }));

            toast({
                title: "Track Removed",
                description: "Track removed from playlist successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove track",
                variant: "destructive",
            });
        }
    };

    if (!playlist) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
            <div className="animate-spin">
                <svg
                    className="w-12 h-12 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-primary">Loading Playlist</h3>
                <p className="text-muted-foreground">Your musical journey is about to begin...</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 pt-2">
            <div className="relative">
                {/* Hero Section */}
                <div className="relative h-[300px] rounded-xl overflow-hidden mb-8">
                    {playlist?.coverImage ? (
                        <>
                            <img
                                src={playlist.coverImage}
                                alt={playlist.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                            <Music2 className="w-32 h-32 text-primary/30" />
                        </div>
                    )}

                    {/* Playlist Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            {playlist?.name}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Music2 className="w-4 h-4" />
                            <span>{playlist?.tracks?.length || 0} tracks</span>
                            <span>•</span>
                            <span>Created {new Date(playlist?.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Add Track Dialog */}
                {isOwner && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="mb-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add Tracks
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Add Tracks to Playlist
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search for tracks..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 focus-visible:ring-purple-600"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                    >
                                        Search
                                    </Button>
                                </form>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                                        {searchResults.map((video) => (
                                            <div
                                                key={video.id}
                                                className="group flex items-center justify-between p-3 hover:bg-accent/50 rounded-xl transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={video.thumbnail}
                                                            alt={video.title}
                                                            className="w-16 h-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                                                            {video.title}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {video.channelTitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        handleAddToPlaylist(video);
                                                        setIsDialogOpen(false);
                                                    }}
                                                    variant="ghost"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Playlist Tracks */}
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Tracks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {playlist?.tracks?.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="group flex items-center justify-between p-3 hover:bg-accent/50 rounded-xl transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 text-sm text-muted-foreground">
                                            {index + 1}
                                        </div>
                                        <div className="relative">
                                            <img
                                                src={track.thumbnail}
                                                alt={track.title}
                                                className="w-16 h-16 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div>
                                            <p className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                                                {track.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {track.channelTitle}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isOwner && (
                                            <Drawer>
                                                <DrawerTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="rounded-full hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white"
                                                    >
                                                        <ArrowUpDown className="h-5 w-5" />
                                                    </Button>
                                                </DrawerTrigger>
                                                <DrawerContent className="z-[9999] bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-lg border-t-2 border-primary/20">
                                                    <DrawerHeader className="border-b border-primary/10">
                                                        <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                            Reorder Track
                                                        </DrawerTitle>
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            Current Position: {index + 1}
                                                        </p>
                                                    </DrawerHeader>
                                                    <div className="p-6 flex justify-center items-center">
                                                        <div className={`grid ${playlist.tracks.length <= 4 ? 'grid-cols-4' : 'grid-cols-8'} auto-rows-auto gap-2 place-items-center w-fit mx-auto`}>
                                                            {Array.from({ length: playlist.tracks.length }, (_, i) => (
                                                                <Button
                                                                    key={i}
                                                                    variant={i === index ? "default" : "outline"}
                                                                    onClick={() => handleReorderTrack(track.id, i)}
                                                                    className={`h-10 w-10 rounded-lg transition-all duration-300 ${i === index
                                                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                                        : 'hover:bg-gradient-to-r hover:from-purple-600/90 hover:to-blue-600/90 hover:text-white'
                                                                        }`}
                                                                >
                                                                    {i + 1}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-4 text-center">
                                                        Click on a number to move "{track.title}" to that position
                                                    </p>
                                                </DrawerContent>
                                            </Drawer>
                                        )}
                                        <Button
                                            onClick={() => handlePlayTrack(track)}
                                            variant="ghost"
                                            className="rounded-full hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white"
                                        >
                                            {currentTrack?.id === track.id && isPlaying ? (
                                                <Pause className="h-5 w-5" />
                                            ) : (
                                                <Play className="h-5 w-5" />
                                            )}
                                        </Button>
                                        {isOwner && (
                                            <Button
                                                onClick={() => handleDeleteTrack(track)}
                                                variant="ghost"
                                                className="rounded-full hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlaylistDetail;
