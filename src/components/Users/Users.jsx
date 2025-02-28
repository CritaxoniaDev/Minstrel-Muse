import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Search, Users as UsersIcon, Shield, Clock, UserCheck } from 'lucide-react';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUsers = async () => {
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
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.uid !== currentUser?.uid &&
        (user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.map((user) => (
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
