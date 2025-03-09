import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Music, Music2, User, ArrowLeft, Play, Plus, Heart } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { Badge } from "@/components/ui/badge";

const Profile = ({ onPlayPause }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const currentUser = auth.currentUser;
    const isOwnProfile = currentUser?.uid === userId;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const postsRef = collection(db, "posts");
                const q = query(postsRef, where("userId", "==", userId));
                const querySnapshot = await getDocs(q);

                const postsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                }));

                setPosts(postsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user posts:", error);
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [userId]);

    const handleLikePost = async (postId) => {
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);

        if (postDoc.exists()) {
            const currentLikes = postDoc.data().likes || [];
            const isLiked = currentLikes.includes(currentUser.uid);

            await updateDoc(postRef, {
                likes: isLiked
                    ? currentLikes.filter(id => id !== currentUser.uid)
                    : [...currentLikes, currentUser.uid]
            });

            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: isLiked
                            ? currentLikes.filter(id => id !== currentUser.uid)
                            : [...currentLikes, currentUser.uid]
                    };
                }
                return post;
            }));
        }
    };

    const handlePlayTrack = (song) => {
        const trackToPlay = {
            id: song.id,
            title: song.title,
            thumbnail: song.thumbnail,
            channelTitle: song.channelTitle
        };
        onPlayPause(trackToPlay);
    };

    // Update the handleEditClick function
    const handleEditClick = async () => {
        if (!isOwnProfile) return;

        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            setBio(userDoc.data().bio || '');
        }
        setIsEditing(true);
    };

    // Update the handleUpdateProfile function
    const handleUpdateProfile = async () => {
        if (!isOwnProfile) return;

        try {
            await updateDoc(doc(db, "users", userId), {
                bio: bio
            });
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;

            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setProfileUser({
                    id: userDoc.id,
                    ...userData
                });
                // Set favorites from user document
                setFavoriteSongs(userData.favorites || []);
            }

            const playlistsQuery = query(
                collection(db, "playlists"),
                where("userId", "==", userId)
            );
            const playlistsSnapshot = await getDocs(playlistsQuery);
            const playlists = playlistsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserPlaylists(playlists);
        };

        fetchUserData();
    }, [userId]);

    if (!profileUser) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black/95 pb-20">
            <div className="max-w-6xl mx-auto">
                {/* Hero Banner */}
                <div className="relative h-[250px] md:h-[350px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 animate-gradient-xy">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-soft-light" />
                    </div>

                    {/* Profile Navigation */}
                    <div className="absolute top-4 left-4 flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/30"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-5 w-5 text-white" />
                        </Button>
                        <div className="text-white">
                            <h2 className="font-semibold text-lg leading-none">{profileUser.name}</h2>
                            <p className="text-sm text-white/80">{userPlaylists.length} playlists</p>
                        </div>
                    </div>
                </div>

                {/* Profile Info Section */}
                <div className="relative px-4 pb-4">
                    <div className="relative -mt-[86px] mb-4 flex justify-between items-end">
                        <Avatar className="h-[172px] w-[172px] rounded-full ring-8 ring-white dark:ring-gray-950 shadow-2xl">
                            <AvatarImage
                                src={profileUser.photoURL}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-5xl">
                                {profileUser.displayName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {!isEditing && isOwnProfile && (
                            <Button
                                variant="outline"
                                className="mb-4 bg-white/95 dark:bg-gray-950 backdrop-blur-sm border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                                onClick={handleEditClick}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">{profileUser.name || profileUser.displayName}</h1>
                        <p className="text-muted-foreground">@{profileUser.email?.split('@')[0]}</p>

                        {isEditing ? (
                            <div className="mt-4 flex gap-2">
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="flex-1 p-3 rounded-xl border bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-sm resize-none focus:ring-2 ring-primary/20"
                                    placeholder="Write your bio..."
                                    rows={3}
                                />
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleUpdateProfile}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm max-w-2xl">{profileUser.bio || "No bio yet"}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-t dark:border-gray-800">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="px-2 md:px-4">
                            <TabsList className="flex w-full justify-start gap-1 h-12">
                                <TabsTrigger value="overview" className="flex-1 md:flex-none">Overview</TabsTrigger>
                                <TabsTrigger value="playlists" className="flex-1 md:flex-none">Playlists</TabsTrigger>
                                <TabsTrigger value="favorites" className="flex-1 md:flex-none">Favorites</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="px-4 py-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-none shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-violet-500/10">
                                                <User className="h-6 w-6 text-violet-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                                    {new Date(profileUser.createdAt).getFullYear()}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">Member since</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-none shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-fuchsia-500/10">
                                                <Music className="h-6 w-6 text-fuchsia-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                                                    {userPlaylists.length}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">Playlists Created</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-none shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-pink-500/10">
                                                <Heart className="h-6 w-6 text-pink-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                                    {favoriteSongs.length}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">Songs Favorited</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="playlists" className="px-4 py-6">
                            <div className="grid gap-4">
                                {userPlaylists.map(playlist => (
                                    <Card
                                        key={playlist.id}
                                        className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <CardContent className="p-6">
                                            <div
                                                className="flex items-center gap-4 cursor-pointer"
                                                onClick={() => navigate(`/dashboard/library/${playlist.id}`)}
                                            >
                                                <div className="p-3 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                                                    <Music className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{playlist.name}</h3>
                                                    <p className="text-muted-foreground">
                                                        {playlist.tracks?.length || 0} tracks
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="favorites" className="px-4 py-6">
                            <div className="space-y-4">
                                {favoriteSongs.map(song => (
                                    <Card
                                        key={song.id}
                                        className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <img
                                                        src={song.thumbnail}
                                                        alt={song.title}
                                                        className="h-20 w-20 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300 shadow-lg"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 text-white w-10 h-10 rounded-full"
                                                        onClick={() => handlePlayTrack(song)}
                                                    >
                                                        <Play className="h-5 w-5" />
                                                    </Button>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                                                        {song.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {song.channelTitle}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="bg-primary/5">
                                                            Added {new Date(song.addedAt).toLocaleDateString()}
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-primary/5">
                                                            {song.duration || "3:30"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full hover:bg-primary/10 hover:text-primary"
                                                        onClick={() => handleAddToQueue(song)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="rounded-full hover:bg-red-500/10 hover:text-red-500"
                                                        onClick={() => handleRemoveFromFavorites(song.id)}
                                                    >
                                                        <Heart className="h-4 w-4 fill-current" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {favoriteSongs.length === 0 && (
                                    <div className="text-center p-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border shadow-xl">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl opacity-10 animate-pulse" />
                                            <Music className="h-16 w-16 mx-auto text-primary mb-4 relative z-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                            No favorites yet
                                        </h3>
                                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                            Start adding songs to your favorites while exploring music
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="mt-8 px-4">
                    <h2 className="text-xl font-semibold mb-4">Posts</h2>
                    <div className="space-y-4">
                        {posts.filter(post => post.userId === userId).map(post => (
                            <Card
                                key={post.id}
                                className={cn(
                                    "overflow-hidden backdrop-blur-sm border-none shadow-lg",
                                    "bg-white/50 dark:bg-gray-900/50",
                                    "hover:shadow-xl transition-all duration-300"
                                )}
                            >
                                <CardContent className="p-4">
                                    <div className="flex space-x-4">
                                        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                            <AvatarImage src={post.userPhoto} />
                                            <AvatarFallback>{post.userName?.[0]}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{post.userName}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                                                </span>
                                            </div>

                                            {post.music && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 w-fit px-3 py-1 rounded-full">
                                                    <Music2 className="h-3 w-3" />
                                                    <span className="font-medium bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                                        {post.music.title}
                                                    </span>
                                                </div>
                                            )}

                                            <p className="text-sm">{post.content}</p>

                                            {post.image && (
                                                <div className="flex justify-center mt-2">
                                                    <img
                                                        src={post.image}
                                                        alt="Post attachment"
                                                        className="rounded-lg max-h-[300px] object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 pt-2">
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Heart className="h-4 w-4" />
                                                    <span className="text-xs">{post.likes?.length || 0}</span>
                                                </Button>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-xs">{post.comments?.length || 0}</span>
                                                </Button>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {posts.filter(post => post.userId === userId).length === 0 && (
                            <div className="text-center p-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl opacity-10 animate-pulse" />
                                    <Music2 className="h-12 w-12 mx-auto text-primary/40 mb-3" />
                                </div>
                                <h3 className="text-lg font-medium text-muted-foreground">No posts yet</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
