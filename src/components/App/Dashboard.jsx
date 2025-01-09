import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getYoutubeApiKey, rotateApiKey } from '../../config/youtube-api';
import { Progress } from "@/components/ui/progress";
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';
import {
    Play,
    Pause,
    Music2,
    Users,
    Clock,
    Heart,
    Search,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const Dashboard = ({
    user,
    currentUser, // Add this prop
    currentTrack,
    isPlaying,
    onPlayPause,
}) => {
    // Add responsive breakpoints
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const [users, setUsers] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Current user role:', currentUser?.role);
    }, [currentUser]);

    const fetchYoutubeVideos = async () => {
        let attempts = 0;
        while (attempts < 4) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 10,
                        key: getYoutubeApiKey(),
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

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, currentRole) => {
        try {
            const newRole = currentRole === 'user' ? 'admin' : 'user';
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                role: newRole
            });

            setUsers(users.map(user =>
                user.uid === userId
                    ? { ...user, role: newRole }
                    : user
            ));
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    useEffect(() => {
        fetchYoutubeVideos();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            {/* Hero Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 mb-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Content - Enhanced */}
                        <div className="relative z-10 py-8 flex flex-col justify-center">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 blur-lg"></div>
                                <h1 className="relative text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-x">
                                    Welcome back, {currentUser?.displayName || 'Music Lover'}!
                                    <span className="inline-block animate-wave">👋</span>
                                </h1>
                            </div>

                            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed backdrop-blur-sm">
                                Your personal music dashboard is ready. Discover trending tracks, manage your library, and connect with other music enthusiasts.
                            </p>

                            <div className="mt-8 flex gap-4">
                                <Button
                                    className="bg-primary hover:bg-primary/90 relative overflow-hidden group px-8 py-4"
                                    onClick={() => navigate('/dashboard/library')}
                                >
                                    <span className="absolute inset-0 w-full h-full transition duration-500 ease-out transform translate-x-full bg-gradient-to-r from-purple-600 to-primary group-hover:-translate-x-0" />
                                    <span className="relative flex items-center gap-3 text-lg">
                                        <Music2 className="w-6 h-6 animate-pulse" />
                                        <span className="font-semibold">My Library</span>
                                    </span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="relative overflow-hidden group border-2 border-primary/20 hover:border-primary/50 px-8 py-4"
                                    onClick={() => navigate('/dashboard/search')}
                                >
                                    <span className="absolute inset-0 w-full h-full transition duration-500 ease-out transform -translate-x-full bg-gradient-to-r from-background via-primary/20 to-primary/10 group-hover:translate-x-0" />
                                    <span className="relative flex items-center gap-3 text-lg">
                                        <Search className="w-6 h-6 group-hover:animate-bounce" />
                                        <span className="font-semibold">Discover Music</span>
                                    </span>
                                </Button>
                            </div>
                        </div>

                        {/* Right Content - Enhanced Floating Elements */}
                        <div className="relative hidden md:flex items-center justify-center perspective-1000">
                            {/* Floating Headphones with enhanced animation */}
                            <div className="absolute -top-20 right-0 z-20 animate-float-slow transform hover:scale-110 transition-all duration-700">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 blur-2xl rounded-full"></div>
                                <img
                                    src="/resources/headphones.png"
                                    alt="Headphones"
                                    className="w-48 h-48 object-contain drop-shadow-2xl transform -rotate-12 hover:rotate-0 transition-all duration-700"
                                />
                            </div>

                            <div className="relative w-[700px] h-[600px] animate-float-slower transform rotate-12 hover:rotate-6 transition-transform duration-700 group">
                                {/* Enhanced background effects */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-purple-500/20 to-transparent rounded-3xl transform -rotate-6 scale-95 blur-xl group-hover:scale-100 transition-all duration-700" />
                                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] animate-grid-flow" />

                                <img
                                    src="/resources/mockup.png"
                                    alt="Phone Mockup"
                                    className="w-full h-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                                />

                                {/* Enhanced logo with glow effect */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse"></div>
                                    <img
                                        src="/images/minstrel-logo.png"
                                        alt="Minstrel Logo"
                                        className="relative w-32 h-32 object-contain animate-float drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                                    />
                                </div>

                                {/* Enhanced decorative elements */}
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-primary/20 rounded-full blur-3xl animate-pulse-slow" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced background grid */}
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] animate-grid-flow opacity-50" />
            </div>

            <div className={`grid gap-4 p-6 px-20 pb-32 ${isMobile ? 'grid-cols-1' :
                isTablet ? 'grid-cols-2' :
                    'lg:grid-cols-6'
                }`}>
                {/* Stats Cards Row */}
                <div className={`${isMobile ? 'col-span-1' :
                    isTablet ? 'col-span-2' :
                        'col-span-6'
                    } grid gap-4 ${isMobile ? 'grid-cols-1' :
                        isTablet ? 'grid-cols-2' :
                            'lg:grid-cols-4'
                    }`}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                                Total Songs
                            </CardTitle>
                            <Music2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                                {recentlyPlayed.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">+20 from last week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                                Followers
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                                {users.length}
                            </div>
                            <p className="text-xs text-muted-foreground">+18 new followers</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                                Listening Time
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                                432h
                            </div>
                            <p className="text-xs text-muted-foreground">+12h this week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                                Liked Songs
                            </CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                                432
                            </div>
                            <p className="text-xs text-muted-foreground">+8 new likes</p>
                        </CardContent>
                    </Card>
                </div>

                <div className={`${isMobile ? 'col-span-1' : isTablet ? 'col-span-2' : 'col-span-6'}`}>
                    <div className="flex flex-col items-center mb-8 mt-16">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Recently Played
                        </h2>
                        <p className="text-muted-foreground mt-2">Your latest music discoveries</p>
                    </div>

                    <Carousel
                        opts={{
                            align: "center",
                            loop: true,
                            slidesToScroll: 1,
                            containScroll: "trimSnaps",
                        }}
                        className="w-full max-w-[90vw] mx-auto"
                    >
                        <CarouselContent className="-ml-4 mb-16">
                            {recentlyPlayed.slice(0, 10).map((video) => (
                                <CarouselItem key={video.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
                                    <Card className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className="aspect-square relative">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-primary/90 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-primary"
                                                onClick={() => onPlayPause(video)}
                                            >
                                                {currentTrack?.id === video.id && isPlaying ? (
                                                    <Pause className="h-6 w-6" />
                                                ) : (
                                                    <Play className="h-6 w-6" />
                                                )}
                                            </Button>
                                            <span className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded-full">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                                                {video.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
                                        </div>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12" />
                        <CarouselNext className="hidden md:flex -right-12" />
                    </Carousel>
                </div>

                {/* Active Users Section */}
                <div className={`${isMobile ? 'col-span-1' : isTablet ? 'col-span-2' : 'col-span-6 lg:col-span-4'}`}>
                    <Card>
                        <CardHeader>
                            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                                Active Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer ${isMobile ? 'flex-col gap-2' : 'flex-row'}`}
                                            onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                                        >
                                            <div className={`flex items-center ${isMobile ? 'flex-col text-center' : 'space-x-4'}`}>
                                                <Avatar className={`${isMobile ? 'h-16 w-16' : 'h-10 w-10'}`}>
                                                    <AvatarImage src={user?.photoURL} alt={user?.name || 'User'} />
                                                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                                                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={isMobile ? 'mt-2' : ''}>
                                                    <p className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                                                        {user?.name || 'Anonymous'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                                    <p className="text-xs text-muted-foreground">Role: {user?.role || 'user'}</p>
                                                </div>
                                            </div>
                                            <div className={`flex items-center ${isMobile ? 'w-full justify-center' : 'space-x-2'}`}>
                                                {user?.role !== 'admin' && currentUser?.role === 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRoleChange(user.uid, user.role);
                                                        }}
                                                        className={`${isMobile ? 'w-full' : 'px-2 py-1'} rounded-full text-xs bg-purple-100 text-purple-700 hover:bg-purple-200`}
                                                    >
                                                        Change Role
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
                                            <User className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                            Welcome to MinstrelMuse!
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                            Be the first to join our vibrant community. Start your musical journey today!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Profile Section */}
                <div className={`${isMobile ? 'col-span-1' :
                    isTablet ? 'col-span-2' :
                        'col-span-6 lg:col-span-2'
                    }`}>
                    <Card>
                        <CardHeader>
                            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <Avatar className={`${isMobile ? 'h-24 w-24' : 'h-20 w-20'}`}>
                                <AvatarImage src={currentUser?.photoURL} />
                                <AvatarFallback>{currentUser?.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h3 className={`${isMobile ? 'text-xl' : 'text-lg'} font-medium`}>
                                    {currentUser?.displayName || 'User'}
                                </h3>
                                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
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
        </div>
    );
};

export default Dashboard;
