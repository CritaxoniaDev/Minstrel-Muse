import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Search, Users as UsersIcon, Shield, Clock, UserCheck } from 'lucide-react';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

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
                setFilteredUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchUserPlaylists = async () => {
            const playlistPromises = filteredUsers.map(async (user) => {
                const q = query(
                    collection(db, "playlists"),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                return {
                    userId: user.uid,
                    playlists: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                };
            });

            const results = await Promise.all(playlistPromises);
            const playlistsMap = results.reduce((acc, curr) => {
                acc[curr.userId] = curr.playlists;
                return acc;
            }, {});

            setUserPlaylists(playlistsMap);
        };

        if (filteredUsers.length > 0) {
            fetchUserPlaylists();
        }
    }, [filteredUsers]);

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Connect with other music enthusiasts on MinstrelMuse.</p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all" className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4" />
                            All Users
                        </TabsTrigger>
                        <TabsTrigger value="online" className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Online
                        </TabsTrigger>
                        <TabsTrigger value="recent" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Recent
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => (
                                <Card
                                    key={user.uid}
                                    className="group hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/20 backdrop-blur-sm"
                                    onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                                >
                                    <CardContent className="p-6 flex flex-col space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="relative">
                                                <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-background ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                                                    <AvatarImage src={user.photoURL} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 font-medium">
                                                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span
                                                    className={cn(
                                                        "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background",
                                                        user.isOnline
                                                            ? "bg-green-500 animate-pulse shadow-glow"
                                                            : "bg-gray-400"
                                                    )}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-lg truncate">
                                                        {user.name || 'Anonymous'}
                                                    </h3>
                                                    {user.role === 'admin' && (
                                                        <Badge variant="secondary" className="flex items-center gap-1 bg-primary/10">
                                                            <Shield className="h-3 w-3" />
                                                            Admin
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors">
                                                {userPlaylists[user.uid]?.length || 0} Playlists
                                            </Badge>
                                            <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 transition-colors">
                                                {user.followers?.length || 0} Followers
                                            </Badge>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Add follow logic here
                                                }}
                                            >
                                                Follow
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="online" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.filter(user => user.isOnline).map((user) => (
                                <Card
                                    key={user.uid}
                                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback className="bg-primary/10">
                                                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background bg-green-500 animate-pulse" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{user.name || 'Anonymous'}</h3>
                                                    {user.role === 'admin' && (
                                                        <Badge variant="secondary" className="flex items-center gap-1">
                                                            <Shield className="h-3 w-3" />
                                                            Admin
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="bg-primary/5">
                                                        {user.playlists?.length || 0} Playlists
                                                    </Badge>
                                                    <Badge variant="outline" className="bg-primary/5">
                                                        {user.followers?.length || 0} Followers
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Add follow logic here
                                                }}
                                            >
                                                Follow
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="recent" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers
                                .sort((a, b) => b.lastActive?.toDate() - a.lastActive?.toDate())
                                .slice(0, 12)
                                .map((user) => (
                                    <Card
                                        key={user.uid}
                                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                                        <AvatarImage src={user.photoURL} />
                                                        <AvatarFallback className="bg-primary/10">
                                                            {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span
                                                        className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background 
                                    ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{user.name || 'Anonymous'}</h3>
                                                        {user.role === 'admin' && (
                                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                                <Shield className="h-3 w-3" />
                                                                Admin
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="bg-primary/5">
                                                            {user.playlists?.length || 0} Playlists
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-primary/5">
                                                            {user.followers?.length || 0} Followers
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Add follow logic here
                                                    }}
                                                >
                                                    Follow
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Users;
