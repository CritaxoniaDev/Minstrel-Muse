import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import { cn } from '@/lib/utils';
import { db } from '@/config/firebase';
import { Badge } from "@/components/ui/badge";
import {
    Music2, Users, Heart, Image, MessageCircle, Share2, Smile, Repeat2
} from "lucide-react";

const Dashboard = ({ currentUser, currentTrack, isPlayerPage }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

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

    useEffect(() => {
        const fetchPosts = async () => {
            const postsRef = collection(db, "posts");
            const q = query(postsRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            setPosts(postsData);
        };

        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-background mb-20">
            <div className={cn(
                "container mx-auto px-4 py-6 grid grid-cols-1 gap-6",
                isDesktop ? "md:grid-cols-12" : "md:grid-cols-1",
                currentTrack && !isPlayerPage && isDesktop ? "mr-80" : ""
            )}>
                {/* Left Column - Stats */}
                <div className={cn(
                    "space-y-4",
                    isDesktop ? "md:col-span-3" : "w-full",
                    currentTrack && !isPlayerPage && !isDesktop ? "hidden" : ""
                )}>
                    <Card className={cn(
                        "sticky",
                        isMobile ? "relative" : "top-20"
                    )}>
                        <CardHeader>
                            <h3 className="font-semibold">Your Music Stats</h3>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className={cn(
                                "grid gap-4",
                                isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2" : "grid-cols-2"
                            )}>
                                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                                    <h4 className="text-2xl font-bold text-primary">247</h4>
                                    <p className="text-sm text-muted-foreground">Playlists</p>
                                </div>
                                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                                    <h4 className="text-2xl font-bold text-primary">1.2K</h4>
                                    <p className="text-sm text-muted-foreground">Favorites</p>
                                </div>
                                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                                    <h4 className="text-2xl font-bold text-primary">48h</h4>
                                    <p className="text-sm text-muted-foreground">Listened</p>
                                </div>
                                <div className="text-center p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                                    <h4 className="text-2xl font-bold text-primary">183</h4>
                                    <p className="text-sm text-muted-foreground">Following</p>
                                </div>
                            </div>

                            <div className={cn(
                                "space-y-3",
                                isMobile ? "hidden" : "block"
                            )}>
                                <h4 className="font-medium">Recent Activity</h4>
                                {[1, 2, 3].map((activity) => (
                                    <div key={activity} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer group">
                                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse group-hover:bg-primary/80" />
                                        <p className="text-sm group-hover:text-primary transition-colors">Added new song to Summer Vibes</p>
                                    </div>
                                ))}
                            </div>

                            <div className={cn(
                                "space-y-3",
                                isMobile ? "hidden" : "block"
                            )}>
                                <h4 className="font-medium">Top Genres</h4>
                                <div className="space-y-2">
                                    {[
                                        { genre: "Pop", percentage: "75%" },
                                        { genre: "Rock", percentage: "60%" },
                                        { genre: "Hip Hop", percentage: "45%" }
                                    ].map((item) => (
                                        <div key={item.genre} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.genre}</span>
                                                <span className="text-muted-foreground">{item.percentage}</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: item.percentage }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <main className={cn(
                    "space-y-6",
                    isDesktop ? "md:col-span-6" : "w-full",
                    currentTrack && !isPlayerPage && !isDesktop ? "col-span-12" : ""
                )}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex space-x-4">
                                <Avatar>
                                    <AvatarImage src={currentUser?.photoURL} />
                                    <AvatarFallback>{currentUser?.displayName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-4">
                                    <Input
                                        placeholder="Share what you're listening to..."
                                        className="bg-muted"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" disabled>
                                                <Image className="h-4 w-4 mr-2" />
                                                Photo
                                            </Button>
                                            <Button variant="outline" size="sm" disabled>
                                                <Music2 className="h-4 w-4 mr-2" />
                                                Music
                                            </Button>
                                            <Button variant="outline" size="sm" disabled>
                                                <Smile className="h-4 w-4 mr-2" />
                                                Feeling
                                            </Button>
                                        </div>
                                        <Button
                                            className="bg-primary hover:bg-primary/90"
                                            onClick={() => navigate('/dashboard/create-post')}
                                        >
                                            Create Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="foryou">
                        <TabsList className="w-full">
                            <TabsTrigger value="foryou" className="flex-1">For You</TabsTrigger>
                            <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
                            <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
                        </TabsList>

                        <TabsContent value="foryou" className="space-y-4 mt-4">
                            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-primary/20">
                                <CardContent className="p-6">
                                    <div className="flex space-x-4">
                                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                            <AvatarImage src="https://github.com/gianalcantara.png" />
                                            <AvatarFallback>GA</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-semibold text-primary">Adiklaas</h4>
                                                <Badge variant="secondary">Creator</Badge>
                                                <span className="text-sm text-muted-foreground">· Just now</span>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-lg">Welcome to MinstrelMuse! 🎵✨</p>
                                                <p className="text-muted-foreground">
                                                    Ready to discover amazing music and connect with fellow music lovers?
                                                    Start by creating your first playlist or explore trending tracks.
                                                    Let the music journey begin! 🚀
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline" className="bg-primary/5">#WelcomeToMinstrel</Badge>
                                                    <Badge variant="outline" className="bg-primary/5">#MusicCommunity</Badge>
                                                    <Badge variant="outline" className="bg-primary/5">#DiscoverMusic</Badge>
                                                </div>
                                            </div>
                                            <div className="flex space-x-6 mt-4">
                                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                                    <Heart className="h-4 w-4 mr-2 fill-current" />
                                                    1.2K
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Reply
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Share
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {posts.map((post) => (
                                <Card key={post.id} className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex space-x-4">
                                            <Avatar>
                                                <AvatarImage src={post.userPhoto} />
                                                <AvatarFallback>{post.userName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-semibold">{post.userName}</h4>
                                                    {post.music && (
                                                        <>
                                                            <span className="text-sm text-muted-foreground">is listening to</span>
                                                            <span className="text-sm font-medium text-primary">{post.music.title}</span>
                                                        </>
                                                    )}
                                                    <span className="text-sm text-muted-foreground">
                                                        · {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                                                    </span>
                                                </div>

                                                <p>{post.content}</p>

                                                {post.image && (
                                                    <div className="mt-3 rounded-lg overflow-hidden">
                                                        <img src={post.image} alt="Post" className="w-full object-cover max-h-96" />
                                                    </div>
                                                )}

                                                <div className="flex space-x-6 mt-4">
                                                    <Button variant="ghost" size="sm">
                                                        <Heart className="h-4 w-4 mr-2" />
                                                        {post.likes || 0}
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        {post.comments || 0}
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Repeat2 className="h-4 w-4 mr-2" />
                                                        {post.shares || 0}
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Share
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    </Tabs>
                </main>

                {/* Right Column */}
                <div className={cn(
                    "md:col-span-3",
                    currentTrack && !isPlayerPage && !isDesktop ? "hidden" : ""
                )}>
                    <div className="sticky top-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-primary animate-pulse" />
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                            Active Users
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {users.length} online
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                {users.filter(u => u.uid !== currentUser.uid).slice(0, 5).map((user) => (
                                    <div
                                        key={user.uid}
                                        className="group transition-all duration-300 cursor-pointer flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 mb-2"
                                        onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors ring-2 ring-offset-2 ring-offset-background ring-transparent group-hover:ring-primary/20">
                                                <AvatarImage src={user?.photoURL} />
                                                <AvatarFallback className="bg-primary/10">
                                                    {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'} ${user.isOnline ? 'animate-pulse' : ''}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                {user?.name || 'Anonymous'}
                                            </p>
                                            <p className="text-xs text-muted-foreground group-hover:text-primary/70">
                                                {user.isOnline ? 'Active now' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {users.length > 5 && (
                                    <Button
                                        variant="ghost"
                                        className="w-full mt-2 hover:bg-primary/5"
                                        onClick={() => navigate('/dashboard/users')}
                                    >
                                        See More Users
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Suggested Artists</h3>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {[1, 2, 3].map((artist) => (
                                    <div key={artist} className="flex items-center justify-between group hover:bg-muted p-2 rounded-lg transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarImage src={`https://api.dicebear.com/6.x/avatars/svg?seed=artist${artist}`} />
                                                <AvatarFallback>AR</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">Artist Name</p>
                                                <p className="text-sm text-muted-foreground">1.2M followers</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white transition-colors">
                                            Follow
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
