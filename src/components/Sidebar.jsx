import { db } from "@/config/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Home, Compass, Library, Users, Settings, Music2, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from 'react';

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};

const Sidebar = ({ user }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [playlistCount, setPlaylistCount] = useState(0);
    const [users, setUsers] = useState([]);

    // Add this useEffect for fetching users
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
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchPlaylistCount = async () => {
            if (!user?.uid) return;

            try {
                const playlistsRef = collection(db, "playlists");
                const q = query(playlistsRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                setPlaylistCount(querySnapshot.size);
            } catch (error) {
                console.error("Error fetching playlist count:", error);
            }
        };

        if (user) {
            fetchPlaylistCount();
        }
    }, [user]);

    const menuItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Compass, label: 'Discover', path: '/dashboard/discover' },
        { icon: Library, label: 'Library', path: '/dashboard/library' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
    ];

    const sidebarContent = (
        <>
            {/* Profile Section */}
            <div className="flex flex-col items-center space-y-4 mb-8">
                <div className="relative group">
                    <img
                        src={user?.photoURL}
                        alt={user?.displayName}
                        className="h-24 w-24 rounded-full border-4 border-purple-500/20 transition-transform duration-300 group-hover:scale-105"
                        onClick={() => navigate('/dashboard/profile')}
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Music2 className="h-3 w-3" />
                        Online
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Navigation */}
            <nav className="space-y-2 mt-auto">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Button
                            key={index}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-2 hover:bg-accent transition-all duration-200",
                                window.location.pathname === item.path &&
                                "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-500"
                            )}
                            onClick={() => {
                                navigate(item.path);
                                !isDesktop && setIsOpen(false);
                            }}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Button>
                    );
                })}
            </nav>

            <Separator className="my-4" />

            {/* Active Users Section */}
            <div className="relative">
                <div className="flex items-center gap-2 px-2 mb-4">
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

                <div className="space-y-2">
                    {users.slice(0, 3).map((user) => (
                        <div
                            key={user.uid}
                            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-all duration-300 cursor-pointer"
                        >
                            <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                <AvatarImage src={user?.photoURL} />
                                <AvatarFallback className="bg-primary/10">
                                    {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                    {user?.name || 'Anonymous'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                    <p className="text-xs text-muted-foreground group-hover:text-primary/70">
                                        {user.isOnline ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            {!isDesktop && (
                <Button
                    variant="ghost"
                    className="fixed top-4 left-4 z-50 lg:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed left-0 h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6 transition-transform duration-300 ease-in-out z-40",
                isDesktop ? "translate-x-0" : isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {sidebarContent}
            </div>

            {/* Overlay for mobile */}
            {!isDesktop && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
