import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Mail, Music, User, Image, ArrowLeft } from 'lucide-react';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const isOwnProfile = !userId || userId === auth.currentUser.uid;
    const [formData, setFormData] = useState({
        name: '',
        photoURL: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const userDoc = await getDoc(doc(db, "users", userId || auth.currentUser.uid));
            if (userDoc.exists()) {
                const data = { ...userDoc.data(), uid: userDoc.id };
                setUserData(data);
                setFormData({
                    name: data.name || '',
                    photoURL: data.photoURL || '',
                });
            }
        };
        fetchUserData();
    }, [userId]);

    const handleUpdate = async () => {
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), formData);
            setUserData({ ...userData, ...formData });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    if (!userData) return <div></div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
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
                            <AvatarImage src={userData.photoURL} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white text-2xl">
                                {userData.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <CardContent className="pt-20">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{userData.name}</h2>
                            <p className="text-muted-foreground">{userData.email}</p>
                        </div>
                        {isOwnProfile && (
                            <Button
                                onClick={() => setIsEditing(!isEditing)}
                                variant={isEditing ? "destructive" : "default"}
                            >
                                {isEditing ? "Cancel" : "Edit Profile"}
                            </Button>
                        )}
                    </div>

                    <Tabs defaultValue="overview" className="mt-6">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="playlists">Playlists</TabsTrigger>
                            <TabsTrigger value="favorites">Favorites</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {isEditing && isOwnProfile ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Photo URL</label>
                                        <Input
                                            value={formData.photoURL}
                                            onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <Button onClick={handleUpdate}>Save Changes</Button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>Member since {new Date(userData.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Music className="h-4 w-4 text-muted-foreground" />
                                        <span>{userData.playlists?.length || 0} Playlists</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{userData.favorites?.length || 0} Favorite Songs</span>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="playlists">
                            <div className="grid gap-4">
                                {userData.playlists?.length > 0 ? (
                                    userData.playlists.map((playlist, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-accent">
                                            <Music className="h-5 w-5" />
                                            <div>
                                                <p className="font-medium">{playlist.name}</p>
                                                <p className="text-sm text-muted-foreground">{playlist.songs?.length || 0} songs</p>
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
                                {userData.favorites?.length > 0 ? (
                                    userData.favorites.map((favorite, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-accent">
                                            <Music className="h-5 w-5" />
                                            <div>
                                                <p className="font-medium">{favorite.title}</p>
                                                <p className="text-sm text-muted-foreground">{favorite.artist}</p>
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
