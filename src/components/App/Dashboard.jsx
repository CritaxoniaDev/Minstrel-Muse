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
import { useToast } from "@/hooks/use-toast";
import { EmojiPicker } from "@/components/ui/emoji-picker";
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
    const [shareUrl, setShareUrl] = useState('');
    const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(null);
    const { toast } = useToast();

    const handleCommentEmojiSelect = (emoji) => {
        setCommentText(commentText + emoji.native);
        setShowCommentEmojiPicker(null);
    };

    const handleShare = (postId) => {
        const shareableLink = `https://minstrelmuse.vercel.app/shared/${postId}`;
        navigator.clipboard.writeText(shareableLink);

        toast({
            title: "Link copied!",
            description: "Share link has been copied to clipboard",
        });
    };

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

    return (
        <div className="min-h-screen bg-background mb-10">
            <div className={cn(
                "container mx-auto px-4 py-6",
                "max-w-3xl", // Added max width
                "flex flex-col items-center" // Center alignment
            )}>
                <main className={cn(
                    "space-y-6 w-full", // Full width within container
                    "px-0",
                    "md:px-4",
                    "lg:px-2",
                )}>

                    {loading ? (
                        <Card className="transform transition-all duration-300">
                            <CardContent className="p-4">
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
                        <div className="sticky top-16 bg-white z-30 border-gray-300 mt-6 shadow-sm">
                            <TabsList className="w-full grid grid-cols-3 px-2">
                                <TabsTrigger value="foryou" className="text-sm">For You</TabsTrigger>
                                <TabsTrigger value="following" className="text-sm">Following</TabsTrigger>
                                <TabsTrigger value="trending" className="text-sm">Trending</TabsTrigger>
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
                                                className="overflow-hidden border-l border-r border-gray-300 dark:border-border/90"
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
                                                                    onClick={() => handleShare(post.id)}
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
                                                                        <div className="flex-1 flex items-center gap-2 relative">
                                                                            <div className="flex-1 relative">
                                                                                <Input
                                                                                    value={commentText}
                                                                                    onChange={(e) => setCommentText(e.target.value)}
                                                                                    placeholder="Write a comment..."
                                                                                    className="flex-1 h-8 text-sm bg-muted/50 pr-8"
                                                                                />
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                                                                                    onClick={() => setShowCommentEmojiPicker(post.id)}
                                                                                >
                                                                                    <Smile className="h-4 w-4 text-muted-foreground" />
                                                                                </Button>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-8"
                                                                                onClick={() => handleComment(post)}
                                                                                disabled={!commentText.trim()}
                                                                            >
                                                                                Post
                                                                            </Button>
                                                                            {showCommentEmojiPicker === post.id && (
                                                                                <div className="absolute right-0 bottom-full mb-2 z-50">
                                                                                    <EmojiPicker
                                                                                        onEmojiSelect={handleCommentEmojiSelect}
                                                                                        theme="light"
                                                                                        className="border border-border shadow-lg"
                                                                                    />
                                                                                </div>
                                                                            )}
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

                        <TabsContent value="following" className="pt-8">
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                                <div className="relative">
                                    <Users className="h-16 w-16 text-primary/20" />
                                    <Sparkles className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    Following Feed Coming Soon!
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    We're working on something special! Soon you'll be able to customize your feed with posts from people you follow.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                    <span className="h-[1px] w-8 bg-border"></span>
                                    <span>Stay tuned for updates</span>
                                    <span className="h-[1px] w-8 bg-border"></span>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="trending" className="pt-8">
                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                                <div className="relative">
                                    <Flame className="h-16 w-16 text-primary/20" />
                                    <Sparkles className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                    Trending Section Coming Soon!
                                </h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Get ready to discover what's hot! We're crafting a space to showcase the most popular and trending content.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                    <span className="h-[1px] w-8 bg-border"></span>
                                    <span>Coming in next update</span>
                                    <span className="h-[1px] w-8 bg-border"></span>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
