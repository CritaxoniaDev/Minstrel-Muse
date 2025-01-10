import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
    
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            
            // Fetch user profile
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                setProfileUser({
                    id: userDoc.id,
                    ...userDoc.data()
                });
            }

            // Fetch user playlists
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

            // Fetch favorite songs
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
        <div className="container mx-auto p-6 max-w-4xl pb-40">
            <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => navigate('/dashboard')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            <Card className="w-full">
                <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 relative">
                    <div className="absolute -bottom-16 left-6">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                            <AvatarImage src={profileUser.photoURL} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white text-2xl">
                                {profileUser.displayName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <CardContent className="pt-20">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                        <h2 className="text-2xl font-bold">{profileUser.name || profileUser.displayName || 'User'}</h2>
                            <p className="text-muted-foreground">{profileUser.email}</p>
                            <p className="text-sm text-muted-foreground">Role: {profileUser.role || 'User'}</p>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="mt-6">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="playlists">Playlists</TabsTrigger>
                            <TabsTrigger value="favorites">Favorites</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>Google Account</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4 text-muted-foreground" />
                                    <span>{userPlaylists.length} Playlists</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{favoriteSongs.length} Favorite Songs</span>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="playlists">
                            <div className="grid gap-4">
                                {userPlaylists.length > 0 ? (
                                    userPlaylists.map(playlist => (
                                        <div key={playlist.id} 
                                            className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                                            onClick={() => navigate(`/dashboard/playlist/${playlist.id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Music className="h-5 w-5 text-primary" />
                                                <div>
                                                    <h3 className="font-medium">{playlist.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {playlist.songs?.length || 0} songs
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No playlists created yet.</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="favorites">
                            <div className="grid gap-4">
                                {favoriteSongs.length > 0 ? (
                                    favoriteSongs.map(song => (
                                        <div key={song.id} 
                                            className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Music className="h-5 w-5 text-primary" />
                                                <div>
                                                    <h3 className="font-medium">{song.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {song.artist}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No favorite songs added yet.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
