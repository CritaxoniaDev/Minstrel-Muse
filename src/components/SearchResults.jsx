import { Button } from "./ui/button";
import { Play, Pause, Plus, Music2, SearchX, ListPlus, Heart } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useMediaQuery } from 'react-responsive';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useToast } from '../hooks/use-toast';

const decodeHTMLEntities = (text) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

const SearchResults = ({ results, currentTrack, isPlaying, onPlayPause, onAddToQueue, playlists }) => {
    const { toast } = useToast();
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    const handleFavorite = async (video, e) => {
        e.stopPropagation();
        try {
            const favoriteTrack = {
                id: video.id,
                title: video.title,
                thumbnail: video.thumbnail,
                channelTitle: video.channelTitle,
                addedAt: new Date().toISOString()
            };

            const userRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);
            const favorites = userDoc.data().favorites || [];

            const isAlreadyFavorite = favorites.some(track => track.id === video.id);

            if (isAlreadyFavorite) {
                await updateDoc(userRef, {
                    favorites: arrayRemove(favoriteTrack)
                });
                toast({
                    title: "Removed from favorites",
                    description: "Track removed from your favorites",
                    duration: 3000,
                });
            } else {
                await updateDoc(userRef, {
                    favorites: arrayUnion(favoriteTrack)
                });
                toast({
                    title: "Added to favorites",
                    description: "Track added to your favorites",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error updating favorites:", error);
            toast({
                title: "Error",
                description: "Failed to update favorites",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const handleAddToPlaylist = async (video, playlistId) => {
        try {
            // Get current playlist data
            const playlistDoc = await getDoc(doc(db, "playlists", playlistId));
            const playlistData = playlistDoc.data();

            // Check if song already exists
            if (playlistData.tracks?.some(track => track.id === video.id)) {
                toast({
                    title: "Already in playlist",
                    description: "This song is already in the selected playlist",
                    duration: 3000,
                });
                return;
            }

            // Create new track object
            const newTrack = {
                id: video.id,
                title: video.title,
                thumbnail: video.thumbnail,
                channelTitle: video.channelTitle,
                addedAt: new Date().toISOString()
            };

            // Update playlist with new track
            await updateDoc(doc(db, "playlists", playlistId), {
                tracks: arrayUnion(newTrack)
            });

            toast({
                title: "Added to playlist",
                description: "Song has been added to your playlist successfully",
                duration: 3000,
            });
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            toast({
                title: "Error",
                description: "Failed to add song to playlist",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    return (
        <div className={`container mx-auto ${isMobile ? 'px-2' : 'px-18'} ${isMobile ? 'py-4' : 'py-6'} pb-24`}>
            <div className="flex items-center gap-2 mb-6">
                <Music2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                    Search Results
                </h2>
            </div>

            {results.length === 0 ? (
                <div className={`bg-card rounded-sm ${isMobile ? 'p-6' : 'p-12'} border shadow-xl flex flex-col items-center justify-center text-center`}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-50 animate-pulse" />
                        <SearchX className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} relative z-10 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text`} />
                    </div>
                    <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                        No tracks found
                    </h3>
                    <p className={`text-muted-foreground mt-2 ${isMobile ? 'text-sm' : 'text-base'} max-w-sm bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                        Try searching for your favorite artist, song, or video to start building your playlist
                    </p>
                </div>
            ) : (
                <div className={`bg-card rounded-sm ${isMobile ? 'p-3' : 'p-6'} border shadow-xl`}>
                    {results.map((video) => (
                        <div
                            key={video.id}
                            className={`group relative flex ${isMobile ? 'gap-2' : 'gap-4'} ${isMobile ? 'p-2' : 'p-4'} rounded-lg hover:bg-accent/40 transition-all duration-300 border-b last:border-b-0`}
                        >
                            <div className="shrink-0">
                                <div className={`relative ${isMobile ? 'w-16 h-16' : 'w-24 h-24'} overflow-hidden rounded-lg bg-gradient-to-br from-purple-600/10 to-blue-600/10`}>
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className={`absolute bottom-1.5 right-1.5 bg-black/90 ${isMobile ? 'text-[10px]' : 'text-xs'} text-white px-2 py-0.5 rounded-md backdrop-blur-sm`}>
                                        {video.duration}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-grow flex items-center justify-between min-w-0">
                                <div className={`space-y-1 min-w-0 ${isMobile ? 'mr-2' : ''}`}>
                                    <p className={`font-semibold truncate pr-4 ${isMobile ? 'text-sm' : ''} group-hover:bg-gradient-to-r from-purple-600 to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
                                        {decodeHTMLEntities(video.title)}
                                    </p>
                                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                                        {decodeHTMLEntities(video.channelTitle)}
                                    </p>
                                </div>

                                <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
                                    <Button
                                        variant="ghost"
                                        size={isMobile ? "sm" : "icon"}
                                        className="rounded-full hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white"
                                        onClick={(e) => handleFavorite(video, e)}
                                    >
                                        <Heart
                                            className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} 
                                        ${video.isFavorite ? 'fill-current text-red-500' : ''}`}
                                        />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size={isMobile ? "sm" : "icon"}
                                        className="rounded-full hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white"
                                        onClick={() => onPlayPause(video)}
                                    >
                                        {currentTrack?.id === video.id && isPlaying ? (
                                            <Pause className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                                        ) : (
                                            <Play className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                                        )}
                                    </Button>

                                    {!isMobile && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white"
                                            onClick={() => onAddToQueue(video)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {playlists && playlists.length > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size={isMobile ? "sm" : "icon"}
                                                    className="rounded-full hover:bg-gradient-to-r from-purple-600 to-blue-600 hover:text-white"
                                                >
                                                    <ListPlus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className={`${isMobile ? 'w-40' : 'w-48'}`}>
                                                {playlists.map((playlist) => (
                                                    <DropdownMenuItem
                                                        key={playlist.id}
                                                        onClick={() => handleAddToPlaylist(video, playlist.id)}
                                                        className={`cursor-pointer hover:bg-accent/40 ${isMobile ? 'text-sm' : ''}`}
                                                    >
                                                        {playlist.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
