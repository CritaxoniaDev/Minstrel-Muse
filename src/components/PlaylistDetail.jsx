import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Play, Pause } from "lucide-react";
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '../config/youtube-api';

const PlaylistDetail = ({ user }) => {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
    
        let attempts = 0;
        while (attempts < 11) {
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
                    duration: '3:45' // You might want to fetch actual duration
                }));
    
                setSearchResults(videos);
                break;
    
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error searching videos:', error);
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
        } catch (error) {
            console.error('Error adding track to playlist:', error);
        }
    };

    if (!playlist) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            <CardTitle className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {playlist.name}
            </CardTitle>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Tracks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Search for tracks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button type="submit">Search</Button>
                            </form>

                            <div className="space-y-2">
                                {searchResults.map((video) => (
                                    <div
                                        key={video.id}
                                        className="flex items-center justify-between p-2 hover:bg-accent rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-10 h-10 rounded"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{video.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {video.channelTitle}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleAddToPlaylist(video)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Playlist Tracks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {playlist.tracks?.map((track) => (
                                    <div
                                        key={track.id}
                                        className="flex items-center justify-between p-2 hover:bg-accent rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={track.thumbnail}
                                                alt={track.title}
                                                className="w-10 h-10 rounded"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{track.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {track.channelTitle}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
