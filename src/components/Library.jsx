import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { getYoutubeApiKey, rotateApiKey } from '../config/youtube-api';
import { useToast } from "@/hooks/use-toast";
import { Plus, Library as LibraryIcon, Music2, Trash2, Play, Search, Loader2, AlertCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Library = ({ user, onPlayPause, onAddToQueue }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [initialSongs, setInitialSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user) return;

            try {
                const q = query(collection(db, "playlists"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const playlistsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPlaylists(playlistsData);
            } catch (error) {
                toast({
                    title: "Error fetching playlists",
                    description: "Please try again later",
                    variant: "destructive",
                });
            }
        };

        fetchPlaylists();
    }, [user]);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();

        if (!user || !user.uid) {
            toast({
                title: "Authentication required",
                description: "Please sign in to create playlists",
                variant: "destructive",
            });
            return;
        }

        if (!newPlaylistName.trim() || initialSongs.length === 0) {
            toast({
                title: "Invalid playlist",
                description: "Please add a name and at least one song",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const playlistData = {
                name: newPlaylistName,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                tracks: initialSongs.map(song => ({
                    id: song.id,
                    title: song.title,
                    thumbnail: song.thumbnail,
                    channelTitle: song.channelTitle
                }))
            };

            const playlistRef = await addDoc(collection(db, "playlists"), playlistData);

            setPlaylists(prevPlaylists => [...prevPlaylists, {
                id: playlistRef.id,
                ...playlistData
            }]);

            toast({
                title: "Success",
                description: `Playlist "${newPlaylistName}" created successfully`,
            });

            // Reset form
            setNewPlaylistName('');
            setInitialSongs([]);
            setSearchResults([]);
            setSearchQuery('');
            setShowCreateForm(false);

        } catch (error) {
            console.error('Error creating playlist:', error);
            toast({
                title: "Creation failed",
                description: "Unable to create playlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePlaylist = async (playlistId, e) => {
        e.stopPropagation();

        try {
            await deleteDoc(doc(db, "playlists", playlistId));
            setPlaylists(playlists.filter(playlist => playlist.id !== playlistId));
            toast({
                title: "Playlist deleted",
                description: "Playlist has been removed",
            });
        } catch (error) {
            toast({
                title: "Error deleting playlist",
                description: "Please try again",
                variant: "destructive",
            });
        }
    };

    const handlePlayPlaylist = async (e, playlist) => {
        e.stopPropagation();

        try {
            const playlistDoc = await getDoc(doc(db, "playlists", playlist.id));
            const playlistData = playlistDoc.data();

            if (playlistData?.tracks?.length > 0) {
                const [firstTrack, ...remainingTracks] = playlistData.tracks;
                onPlayPause(firstTrack, remainingTracks);
            }
        } catch (error) {
            console.error('Error playing playlist:', error);
            toast({
                title: "Couldn't play playlist",
                description: "Please try again",
                variant: "destructive",
            });
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            toast({
                title: "Search query required",
                description: "Please enter a search term",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setError(null);

        let attempts = 0;
        while (attempts < 13) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 5,
                        key: getYoutubeApiKey(),
                        type: 'video',
                        q: searchQuery
                    }
                });

                const videos = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.default.url,
                    channelTitle: item.snippet.channelTitle
                }));

                setSearchResults(videos);

                if (videos.length === 0) {
                    toast({
                        title: "No results found",
                        description: "Try a different search term",
                    });
                }
                break;
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    setError("Failed to search for songs. Please try again.");
                    toast({
                        title: "Search failed",
                        description: "Please try again later",
                        variant: "destructive",
                    });
                    break;
                }
            }
        }
        setIsLoading(false);
    };

    const handlePlaylistClick = (playlistId) => {
        navigate(`/dashboard/library/${playlistId}`);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <LibraryIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Your Library
                    </h2>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Playlist
                </Button>
            </div>

            {showCreateForm && (
                <Card className="mb-20 border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Create New Playlist
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleCreatePlaylist} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="playlist-name">Playlist Name</Label>
                                <Input
                                    id="playlist-name"
                                    placeholder="Enter playlist name..."
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    className="focus-visible:ring-purple-600"
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <Label>Add Songs</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search for songs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="focus-visible:ring-purple-600"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4 mr-2" />
                                                Search
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    <div className="space-y-2">
                                        {searchResults.map((video) => (
                                            <div
                                                key={video.id}
                                                className="flex items-center justify-between p-2 hover:bg-accent rounded-lg group transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={video.thumbnail}
                                                            alt={video.title}
                                                            className="w-12 h-12 rounded-md object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {video.channelTitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        if (!initialSongs.find(s => s.id === video.id)) {
                                                            setInitialSongs([...initialSongs, video]);
                                                            toast({
                                                                title: "Song added",
                                                                description: "Song added to playlist",
                                                            });
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    disabled={initialSongs.find(s => s.id === video.id)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {initialSongs.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Selected Songs ({initialSongs.length})</Label>
                                        <ScrollArea className="h-[200px] rounded-md border p-4">
                                            <div className="space-y-2">
                                                {initialSongs.map((song) => (
                                                    <div
                                                        key={song.id}
                                                        className="flex items-center justify-between p-2 bg-accent/50 rounded-lg group"
                                                    >
                                                        <span className="text-sm font-medium">{song.title}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setInitialSongs(initialSongs.filter(s => s.id !== song.id));
                                                                toast({
                                                                    title: "Song removed",
                                                                    description: "Song removed from selection",
                                                                });
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                disabled={!newPlaylistName.trim() || initialSongs.length === 0 || isLoading}
                            >
                                Create Playlist ({initialSongs.length} songs)
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.length === 0 ? (
                    <Card className="col-span-full p-6 text-center border-2 border-dashed border-primary/20">
                        <div className="flex flex-col items-center gap-2">
                            <Music2 className="w-12 h-12 text-muted-foreground" />
                            <h3 className="text-lg font-medium">No Playlists Yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Create your first playlist to start organizing your music
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Playlist
                            </Button>
                        </div>
                    </Card>
                ) : (
                    playlists.map((playlist) => (
                        <Card
                            key={playlist.id}
                            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-primary/20 bg-gradient-to-br from-background/80 to-background hover:scale-[1.02] relative overflow-hidden"
                            onClick={() => handlePlaylistClick(playlist.id)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Music2 className="w-6 h-6 text-primary group-hover:text-purple-500 transition-colors" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                            {playlist.name}
                                        </CardTitle>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full bg-purple-600/10 hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white transition-all duration-300"
                                        onClick={(e) => handlePlayPlaylist(e, playlist)}
                                    >
                                        <Play className="h-5 w-5" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full bg-red-600/10 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="sm:max-w-[425px] bg-gradient-to-br from-background to-background/95 border-2 border-destructive/20">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
                                                    Delete Playlist
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    Are you sure you want to delete "{playlist.name}"? This action cannot be undone and all tracks will be removed from this playlist.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="border-2 border-muted hover:bg-accent hover:text-accent-foreground">
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePlaylist(playlist.id, e);
                                                    }}
                                                >
                                                    Delete Playlist
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div className="h-1 flex-1 bg-primary/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 group-hover:animate-pulse"
                                            style={{ width: `${(playlist.tracks?.length || 0) * 10}%` }}
                                        />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                        {playlist.tracks?.length || 0} tracks
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Library;