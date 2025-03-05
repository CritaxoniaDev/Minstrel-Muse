import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { auth } from '@/config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Music2 } from 'lucide-react';


export default function SharedPost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = auth;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postDoc = await getDoc(doc(db, "posts", postId));
                if (postDoc.exists()) {
                    setPost({ id: postDoc.id, ...postDoc.data() });
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!post) {
        return <div>Post not found</div>;
    }

    if (currentUser) {
        navigate(`/dashboard?post=${postId}`);
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Shared Post
            </h1>
            <p className="text-muted-foreground text-lg">
                Join our community to discover more amazing content
            </p>
        </div>

        {/* Post content */}
        <Card className="transform transition-all duration-300 hover:shadow-lg border-2 border-primary/10">
            <CardContent className="p-6">
                <div className="space-y-6">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarImage src={post.userPhoto} />
                            <AvatarFallback className="bg-primary/10">{post.userName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                {post.userName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{formatDistanceToNow(post.createdAt?.toDate(), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Music info if exists */}
                    {post.music && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 w-fit px-3 py-1.5 rounded-full">
                            <Music2 className="h-4 w-4" />
                            <span>Listening to</span>
                            <span className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {post.music.title}
                            </span>
                        </div>
                    )}

                    {/* Post content */}
                    <p className="text-lg leading-relaxed">{post.content}</p>

                    {/* Post image */}
                    {post.image && (
                        <div className="rounded-xl overflow-hidden ring-1 ring-primary/10">
                            <img 
                                src={post.image} 
                                alt="Post" 
                                className="w-full object-cover"
                            />
                        </div>
                    )}

                    {/* Engagement stats */}
                    <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Heart className="h-5 w-5" />
                            <span>{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageCircle className="h-5 w-5" />
                            <span>{post.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</div>

    );
}
