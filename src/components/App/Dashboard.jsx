import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, orderBy, getDocs, updateDoc, doc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import { cn } from '@/lib/utils';
import { db } from '@/config/firebase';
import { Skeleton } from "@/components/ui/skeleton";
import {
    Music2, Users, Heart, Image, MessageCircle, Share2, Smile, Repeat2, Sparkles, Flame, ThumbsUp
} from "lucide-react";

const Dashboard = ({ currentUser, currentTrack, isPlayerPage }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const [loading, setLoading] = useState(true);
    const [activeReactionPost, setActiveReactionPost] = useState(null);
    const [commentingPost, setCommentingPost] = useState(null);
    const [commentText, setCommentText] = useState('');

    const handleComment = async (post) => {
        try {
            const postRef = doc(db, "posts", post.id);
            const newComment = {
                id: uuidv4(), // You'll need to import { v4 as uuidv4 } from 'uuid'
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userPhoto: currentUser.photoURL,
                content: commentText,
                createdAt: Timestamp.now()
            };

            await updateDoc(postRef, {
                comments: arrayUnion(newComment),
                commentCount: (post.commentCount || 0) + 1
            });

            // Update local state
            const updatedPosts = posts.map(p => {
                if (p.id === post.id) {
                    return {
                        ...p,
                        comments: [...(p.comments || []), newComment],
                        commentCount: (p.commentCount || 0) + 1
                    };
                }
                return p;
            });

            setPosts(updatedPosts);
            setCommentText('');
            setCommentingPost(null);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleReaction = async (post, reactionType) => {
        try {
            const postRef = doc(db, "posts", post.id);
            const currentReactions = post[reactionType] || [];
            const isReacted = currentReactions.includes(currentUser.uid);

            if (isReacted) {
                await updateDoc(postRef, {
                    [reactionType]: currentReactions.filter(id => id !== currentUser.uid),
                    [`${reactionType}Count`]: (post[`${reactionType}Count`] || 0) - 1
                });
            } else {
                await updateDoc(postRef, {
                    [reactionType]: [...currentReactions, currentUser.uid],
                    [`${reactionType}Count`]: (post[`${reactionType}Count`] || 0) + 1
                });
            }

            const updatedPosts = posts.map(p => {
                if (p.id === post.id) {
                    return {
                        ...p,
                        [reactionType]: isReacted ?
                            currentReactions.filter(id => id !== currentUser.uid) :
                            [...currentReactions, currentUser.uid],
                        [`${reactionType}Count`]: isReacted ?
                            (p[`${reactionType}Count`] || 0) - 1 :
                            (p[`${reactionType}Count`] || 0) + 1
                    };
                }
                return p;
            });
            setPosts(updatedPosts);
        } catch (error) {
            console.error("Error updating reaction:", error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
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
                setTimeout(() => setLoading(false), 1500);
            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsRef = collection(db, "posts");
                const q = query(postsRef, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const postsData = await Promise.all(querySnapshot.docs.map(async doc => {
                    const postData = doc.data();
                    const userDoc = users.find(user => user.uid === postData.userId);

                    return {
                        id: doc.id,
                        ...postData,
                        comments: Array.isArray(postData.comments) ? postData.comments : [],
                        commentCount: postData.commentCount || 0,
                        rose: postData.rose || [],
                        slay: postData.slay || [],
                        wow: postData.wow || [],
                        pensive: postData.pensive || [],
                        roseCount: postData.roseCount || 0,
                        slayCount: postData.slayCount || 0,
                        wowCount: postData.wowCount || 0,
                        pensiveCount: postData.pensiveCount || 0,
                        createdAt: postData.createdAt?.toDate(),
                        userName: userDoc?.name || 'Anonymous',
                        userPhoto: userDoc?.photoURL,
                        email: userDoc?.email
                    };
                }));

                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        if (users.length > 0) {
            fetchPosts();
        }
    }, [users]);

    const PostSkeleton = () => (
        <Card className="border-dashed border border-border/50">
            <CardContent className="p-6">
                <div className="flex space-x-5">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                        <div className="flex items-center space-x-6 pt-4">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // User skeleton component
    const UserSkeleton = () => (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background mb-20">
            <div className={cn(
                "container mx-auto px-4 py-6 grid gap-6",
                "grid-cols-1",
                "md:grid-cols-2",
                "lg:grid-cols-8"
            )}>
                <main className={cn(
                    "space-y-6",
                    "col-span-1",
                    "md:col-span-1",
                    "lg:col-span-5 lg:col-start-2",
                    "px-0",
                    "md:px-4",
                    "lg:px-2",
                )}>

                    {loading ? (
                        <Card className="transform transition-all duration-300">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex space-x-4">
                                    <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full" />
                                    <div className="flex-1 space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap md:flex-nowrap gap-2">
                                                <Skeleton className="h-8 w-20" />
                                                <Skeleton className="h-8 w-20" />
                                                <Skeleton className="h-8 w-20" />
                                            </div>
                                            <Skeleton className="h-8 w-28 md:w-32" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="transform transition-all duration-300 hover:shadow-lg">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex space-x-4">
                                    <Avatar className="h-10 w-10 md:h-12 md:w-12">
                                        <AvatarImage src={currentUser?.photoURL} />
                                        <AvatarFallback>{currentUser?.displayName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-4">
                                        <Input
                                            placeholder="Share what you're listening to..."
                                            className="bg-muted"
                                        />
                                        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap md:flex-nowrap gap-2">
                                                <Button variant="outline" size="sm" className="flex-shrink-0" disabled>
                                                    <Image className="h-4 w-4 mr-2" />
                                                    Photo
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-shrink-0" disabled>
                                                    <Music2 className="h-4 w-4 mr-2" />
                                                    Music
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-shrink-0" disabled>
                                                    <Smile className="h-4 w-4 mr-2" />
                                                    Feeling
                                                </Button>
                                            </div>
                                            <Button
                                                className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                                                onClick={() => navigate('/dashboard/create-post')}
                                            >
                                                Create Post
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="foryou" className="w-full">
                        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/40 mt-6">
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="foryou">For You</TabsTrigger>
                                <TabsTrigger value="following">Following</TabsTrigger>
                                <TabsTrigger value="trending">Trending</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="foryou">
                            <div className="grid">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />)
                                ) : (
                                    <>
                                        {posts.map((post, index) => (
                                            <Card
                                                key={post.id}
                                                className="overflow-hidden border-l border-r border-border dark:border-border/70"
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex space-x-2">
                                                        <Avatar className="h-8 w-8 ring-1 ring-primary/20 hover:ring-primary/40 transition-colors">
                                                            <AvatarImage src={post.userPhoto} />
                                                            <AvatarFallback className="bg-primary/10">{post.userName?.[0]}</AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center flex-wrap gap-1">
                                                                <div className="flex items-center gap-1 group">
                                                                    <h4 className="font-semibold text-base hover:text-primary transition-colors">{post.userName}</h4>
                                                                    <span className="text-xs text-muted-foreground">@{post.email?.split('@')[0]}</span>
                                                                    <span className="text-muted-foreground">·</span>
                                                                    <span className="text-xs text-muted-foreground hover:underline cursor-pointer">
                                                                        {differenceInDays(new Date(), post.createdAt) > 7
                                                                            ? format(post.createdAt, 'MMMM dd')
                                                                            : formatDistanceToNow(post.createdAt, { addSuffix: true })}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {post.music && (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 w-fit px-2 py-1 rounded-full">
                                                                    <Music2 className="h-3 w-3" />
                                                                    <span>Listening to</span>
                                                                    <span className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{post.music.title}</span>
                                                                </div>
                                                            )}

                                                            <p className="text-sm leading-relaxed">{post.content}</p>

                                                            {post.image && (
                                                                <div className="mt-2 overflow-hidden flex justify-center items-center">
                                                                    <img
                                                                        src={post.image}
                                                                        alt="Post"
                                                                        className="h-[300px] object-cover"
                                                                    />
                                                                </div>
                                                            )}

                                                            <div className="flex items-center space-x-4 pt-2 border-t border-border/50">
                                                                <div className="relative group"
                                                                    onMouseEnter={() => setActiveReactionPost(post.id)}
                                                                    onMouseLeave={() => setActiveReactionPost(null)}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 px-2 group transition-colors relative"
                                                                            onClick={() => handleReaction(post, 'pensive')}
                                                                        >
                                                                            <div className="flex -space-x-1 mr-2">
                                                                                {(() => {
                                                                                    // Get the most used reaction for this specific post
                                                                                    const postReactions = [
                                                                                        { type: 'wow', count: post.wowCount || 0, icon: <Flame className="h-4 w-4 text-yellow-500 fill-yellow-500" /> },
                                                                                        { type: 'love', count: post.loveCount || 0, icon: <Heart className="h-4 w-4 text-pink-500 fill-pink-500" /> },
                                                                                        { type: 'slay', count: post.slayCount || 0, icon: <Sparkles className="h-4 w-4 text-purple-500 fill-purple-500" /> },
                                                                                        { type: 'pensive', count: post.pensiveCount || 0, icon: <ThumbsUp className="h-4 w-4 text-blue-500 fill-blue-500" /> }
                                                                                    ];

                                                                                    const mostUsedReaction = postReactions.sort((a, b) => b.count - a.count)[0];
                                                                                    const otherReactions = postReactions.filter(r => r.type !== mostUsedReaction.type);

                                                                                    return (
                                                                                        <>
                                                                                            {mostUsedReaction.count > 0 ? mostUsedReaction.icon : (
                                                                                                <ThumbsUp className={cn(
                                                                                                    "h-4 w-4",
                                                                                                    post.pensive?.includes(currentUser.uid)
                                                                                                        ? "text-blue-500 fill-blue-500"
                                                                                                        : "group-hover:text-blue-500"
                                                                                                )} />
                                                                                            )}

                                                                                            {otherReactions.map(reaction => (
                                                                                                post[reaction.type]?.includes(currentUser.uid) && reaction.icon
                                                                                            ))}
                                                                                        </>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                            <span className="text-sm">
                                                                                {(post.wowCount || 0) + (post.loveCount || 0) + (post.slayCount || 0) + (post.pensiveCount || 0)}
                                                                            </span>
                                                                        </Button>
                                                                    </div>

                                                                    {activeReactionPost === post.id && (
                                                                        <div className="absolute -top-12 left-0 flex items-center gap-1 bg-background/95 backdrop-blur-sm p-2 rounded-full shadow-lg border border-border/50 transition-all duration-200">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 hover:bg-pink-500/10 hover:text-pink-500"
                                                                                onClick={() => handleReaction(post, 'love')}
                                                                            >
                                                                                <Heart className={cn("h-4 w-4", post.love?.includes(currentUser.uid) && "fill-pink-500 text-pink-500")} />
                                                                            </Button>

                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 hover:bg-yellow-500/10 hover:text-yellow-500"
                                                                                onClick={() => handleReaction(post, 'wow')}
                                                                            >
                                                                                <Flame className={cn("h-4 w-4", post.wow?.includes(currentUser.uid) && "fill-yellow-500 text-yellow-500")} />
                                                                            </Button>

                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:text-purple-500"
                                                                                onClick={() => handleReaction(post, 'slay')}
                                                                            >
                                                                                <Sparkles className={cn("h-4 w-4", post.slay?.includes(currentUser.uid) && "fill-purple-500 text-purple-500")} />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 px-2 hover:text-blue-500 hover:bg-blue-500/10 group transition-colors"
                                                                    onClick={() => setCommentingPost(post.id)}
                                                                >
                                                                    <MessageCircle className="h-4 w-4 mr-1 group-hover:fill-blue-500" />
                                                                    <span className="text-sm">{post.commentCount || 0}</span>
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 px-2 hover:text-green-500 hover:bg-green-500/10 group transition-colors"
                                                                >
                                                                    <Repeat2 className="h-4 w-4 mr-1 group-hover:fill-green-500" />
                                                                    <span className="text-sm">{post.shares || 0}</span>
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 px-2 hover:text-primary hover:bg-primary/10 group transition-colors ml-auto"
                                                                >
                                                                    <Share2 className="h-4 w-4 mr-1 group-hover:fill-primary" />
                                                                    <span className="text-sm">Share</span>
                                                                </Button>
                                                            </div>
                                                            {commentingPost === post.id && (
                                                                <div className="mt-3 px-2 space-y-3">
                                                                    {/* Existing comments */}
                                                                    <div className="space-y-3">
                                                                        {post.comments?.map((comment) => (
                                                                            <div key={comment.id} className="flex items-start gap-2 pl-8">
                                                                                <Avatar className="h-5 w-5">
                                                                                    <AvatarImage src={comment.userPhoto} />
                                                                                    <AvatarFallback>{comment.userName?.[0]}</AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <span className="font-medium text-xs">{comment.userName}</span>
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                            {formatDistanceToNow(comment.createdAt?.toDate(), { addSuffix: true })}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-xs mt-0.5">{comment.content}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* New comment input always at bottom */}
                                                                    <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                                                                        <Avatar className="h-6 w-6">
                                                                            <AvatarImage src={currentUser?.photoURL} />
                                                                            <AvatarFallback>{currentUser?.displayName?.[0]}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 flex items-center gap-2">
                                                                            <Input
                                                                                value={commentText}
                                                                                onChange={(e) => setCommentText(e.target.value)}
                                                                                placeholder="Write a comment..."
                                                                                className="flex-1 h-8 text-sm bg-muted/50"
                                                                            />
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-8"
                                                                                onClick={() => handleComment(post)}
                                                                                disabled={!commentText.trim()}
                                                                            >
                                                                                Post
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        <div className="text-center py-8 space-y-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="h-[1px] w-12 bg-border"></span>
                                                <span className="text-muted-foreground text-sm font-medium">You've reached the end! ✨</span>
                                                <span className="h-[1px] w-12 bg-border"></span>
                                            </div>
                                            <div className="text-xs text-muted-foreground/80">Check back later for more updates</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>

                <div className={cn(
                    "col-span-1",
                    "md:col-span-1",
                    "lg:col-span-2",
                    currentTrack && !isPlayerPage && !isDesktop ? "hidden" : "",
                    "order-first md:order-last"
                )}>
                    <div className="sticky top-20 space-y-4">
                        <Card className="transform transition-all duration-300 hover:shadow-lg">
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
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => <UserSkeleton key={i} />)
                                ) : (
                                    users.filter(u => u.uid !== currentUser.uid).slice(0, 5).map((user) => (
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
                                    ))
                                )}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
