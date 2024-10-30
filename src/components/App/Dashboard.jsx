import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import axios from 'axios';
import {
    Play,
    Pause,
    Music2,
    Users,
    Clock,
    Heart
} from "lucide-react";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const Dashboard = ({
    user,
    currentTrack,
    isPlaying,
    onPlayPause,
}) => {
    const [users, setUsers] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const navigate = useNavigate();

    const fetchYoutubeVideos = async () => {
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    maxResults: 5,
                    key: YOUTUBE_API_KEY,
                    type: 'video',
                    q: 'music trending'
                }
            });

            const videos = response.data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.default.url,
                channelTitle: item.snippet.channelTitle,
                duration: '3:45'
            }));

            setRecentlyPlayed(videos);
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            const usersCollection = await getDocs(collection(db, "users"));
            setUsers(usersCollection.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            })));
        };

        fetchUsers();
        fetchYoutubeVideos();
    }, []);

    return (
        <div className="grid lg:grid-cols-6 gap-4 p-6 pb-32">
            {/* Stats Cards Row */}
            <div className="col-span-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
                        <Music2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentlyPlayed.length || 0}</div>
                        <p className="text-xs text-muted-foreground">+20 from last week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Followers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">+18 new followers</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Listening Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">432h</div>
                        <p className="text-xs text-muted-foreground">+12h this week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Liked Songs</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">432</div>
                        <p className="text-xs text-muted-foreground">+8 new likes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recently Played Section */}
            <div className="col-span-6 lg:col-span-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Recently Played</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentlyPlayed.map((video) => (
                                <div
                                    key={video.id}
                                    className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="rounded-md w-12 h-12 object-cover"
                                            />
                                            <span className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                                            <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onPlayPause(video)}
                                    >
                                        {currentTrack?.id === video.id && isPlaying ?
                                            <Pause className="h-4 w-4" /> :
                                            <Play className="h-4 w-4" />
                                        }
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Users Section */}
            <div className="col-span-6 lg:col-span-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users.map((user, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
                                    onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                                                {user.email[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{user.name || 'Anonymous'}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {user.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Profile Section */}
            <div className="col-span-6 lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.photoURL} />
                            <AvatarFallback>{user?.email[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h3 className="text-lg font-medium">{user?.displayName || 'User'}</h3>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Profile Completion</span>
                                <span>85%</span>
                            </div>
                            <Progress value={85} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
