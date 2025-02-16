import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Music, User, ArrowLeft } from 'lucide-react';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');

    const handleEditClick = async () => {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            setBio(userDoc.data().bio || '');
        }
        setIsEditing(true);
    };


    const handleUpdateProfile = async () => {
        try {
            await updateDoc(doc(db, "users", userId), {
                bio: bio
            });
            setIsEditing(false);
            window.location.reload(); // Reload after saving
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;

            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                setProfileUser({
                    id: userDoc.id,
                    ...userDoc.data()
                });
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

            const favoritesQuery = query(
                collection(db, "favorites"),
                where("userId", "==", userId)
            );
            const favoritesSnapshot = await getDocs(favoritesQuery);
            const favorites = favoritesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFavoriteSongs(favorites);
        };

        fetchUserData();
    }, [userId]);

    if (!profileUser) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black">
            <div className="container mx-auto p-4">
                {/* Cover Photo Section */}
                <div className="relative rounded-t-xl overflow-hidden">
                    <div className="h-[300px] bg-gradient-to-r from-blue-400/80 to-purple-400/80 via-indigo-400/80">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                    </div>

                    <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                        <div className="flex items-end gap-6">
                            <Avatar className="h-40 w-40 border-4 border-white dark:border-gray-800 shadow-xl">
                                <AvatarImage src={profileUser.photoURL} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-3xl">
                                    {profileUser.displayName?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mb-4 text-gray-900 dark:text-white">
                                <h1 className="text-3xl font-bold shadow-sm">
                                    {profileUser.name || profileUser.displayName}
                                </h1>
                                <p className="opacity-90">{profileUser.email}</p>
                                {isEditing ? (
                                    <div className="mt-2 flex gap-2">
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-sm"
                                            placeholder="Write your bio..."
                                            rows={2}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleUpdateProfile}
                                                className="bg-green-500 hover:bg-green-600 text-white"
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
                                    <p className="mt-2 max-w-md text-sm">
                                        {profileUser.bio || "No bio yet"}
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isEditing && (
                            <Button
                                variant="outline"
                                className="bg-white/10 backdrop-blur-sm border-white/20 text-gray-900 dark:text-white hover:bg-white/20 transition-colors"
                                onClick={handleEditClick}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg">
                    <Tabs defaultValue="overview" className="p-6">
                        <TabsList className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                            <TabsTrigger
                                value="overview"
                                className="pb-4 text-lg font-medium border-b-2 border-transparent data-[state=active]:border-blue-500"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="playlists"
                                className="pb-4 text-lg font-medium border-b-2 border-transparent data-[state=active]:border-blue-500"
                            >
                                Playlists
                            </TabsTrigger>
                            <TabsTrigger
                                value="favorites"
                                className="pb-4 text-lg font-medium border-b-2 border-transparent data-[state=active]:border-blue-500"
                            >
                                Favorites
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                            <User className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                                                {new Date(profileUser.createdAt).getFullYear()}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">Member since</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                            <Music className="h-6 w-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                                                {userPlaylists.length}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">Playlists Created</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-2xl hover:shadow-lg transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 rounded-full bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors">
                                            <Calendar className="h-6 w-6 text-pink-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                                                {favoriteSongs.length}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">Songs Favorited</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="playlists">
                            <div className="grid gap-4">
                                {userPlaylists.map(playlist => (
                                    <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 cursor-pointer"
                                                onClick={() => navigate(`/dashboard/playlist/${playlist.id}`)}>
                                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                                                    <Music className="h-6 w-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{playlist.name}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        {playlist.tracks?.length || 0} tracks
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="favorites">
                            <div className="grid gap-4">
                                {favoriteSongs.map(song => (
                                    <Card key={song.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                                                    <Music className="h-6 w-6 text-purple-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{song.title}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400">{song.artist}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Profile;
