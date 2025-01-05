import { useNavigate } from 'react-router-dom';
import { auth } from '@/config/firebase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Music, User, ArrowLeft } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const currentUser = auth.currentUser;

    if (!currentUser) return <div>Loading...</div>;

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
                            <AvatarImage src={currentUser.photoURL} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white text-2xl">
                                {currentUser.displayName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <CardContent className="pt-20">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{currentUser.displayName}</h2>
                            <p className="text-muted-foreground">{currentUser.email}</p>
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
                                    <span>0 Playlists</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>0 Favorite Songs</span>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="playlists">
                            <div className="grid gap-4">
                                <p className="text-muted-foreground">No playlists created yet.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="favorites">
                            <div className="grid gap-4">
                                <p className="text-muted-foreground">No favorite songs added yet.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
