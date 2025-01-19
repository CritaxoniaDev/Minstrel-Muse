import { useState, useEffect } from 'react';
import { db } from "@/config/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Home, Compass, Library, Users, Settings, Music2, Menu, Shield, Users2, BarChart3, Database, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

const Sidebar = ({ user, isMinimized, setIsMinimized }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [playlistCount, setPlaylistCount] = useState(0);
    const [users, setUsers] = useState([]);

    const menuItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Compass, label: 'Discover', path: '/dashboard/discover' },
        { icon: Library, label: 'Library', path: '/dashboard/library' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
    ];

    const adminMenuItems = [
        { icon: Shield, label: 'Admin Panel', path: '/dashboard/admin' },
        { icon: Users2, label: 'User Management', path: '/dashboard/admin/users' },
    ];

    const visibleMenuItems = user?.isApproved ? menuItems : [];
    const visibleAdminItems = user?.isApproved && user?.role === 'admin' ? adminMenuItems : [];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
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

    return (
        <>
            {!isDesktop && (
                <Button
                    variant="ghost"
                    className="fixed top-4 left-4 z-[9999] lg:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            )}

            <div className={cn(
                "fixed left-0 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30 transition-all duration-300 ease-in-out z-[9999]",
                isMinimized ? "w-20" : "w-64",
                isDesktop ? "translate-x-0" : isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className={cn("px-6 py-2 space-y-4", isMinimized && "p-2")}>
                    {isDesktop && (
                        <div className={cn(
                            "flex",
                            isMinimized ? "justify-center" : "justify-end"
                        )}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-accent/80 transition-colors"
                                onClick={() => setIsMinimized(!isMinimized)}
                            >
                                {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            <img
                                src={user?.photoURL}
                                alt={user?.displayName}
                                className={cn(
                                    "rounded-full border-4 border-purple-500/20 transition-transform duration-300 group-hover:scale-105",
                                    isMinimized ? "h-10 w-10" : "h-[5.1rem] w-[5.1rem]"
                                )}
                                onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                            />
                            {!isMinimized && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                    <Music2 className="h-3 w-3" />
                                    {user?.role === 'admin' ? 'Admin' : 'Online'}
                                </div>
                            )}
                        </div>
                        {!isMinimized && (
                            <div className="text-center tracking-tighter">
                                <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        )}
                    </div>

                    {!isMinimized && <Separator className="my-4" />}

                    <nav className="space-y-4">
                        <div className="space-y-2">
                            {visibleMenuItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        className={cn(
                                            "w-full transition-all duration-200",
                                            isMinimized ? "px-2 justify-center" : "justify-start gap-2",
                                            window.location.pathname === item.path &&
                                            "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-500"
                                        )}
                                        onClick={() => {
                                            if (isMinimized) {
                                                setIsMinimized(false);
                                            } else {
                                                navigate(item.path);
                                                !isDesktop && setIsOpen(false);
                                            }
                                        }}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {!isMinimized && item.label}
                                    </Button>
                                );
                            })}
                        </div>

                        {!isMinimized && <Separator className="my-4" />}

                        {user?.role === 'admin' && (
                            <>
                                {!isMinimized && (
                                    <div className="px-3 mb-2">
                                        <h2 className="text-sm font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Admin Dashboard</h2>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {visibleAdminItems.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                className={cn(
                                                    "w-full transition-all duration-200 group hover:bg-red-500/5",
                                                    isMinimized ? "px-2 justify-center" : "justify-start",
                                                    window.location.pathname === item.path &&
                                                    "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-500"
                                                )}
                                                onClick={() => {
                                                    if (isMinimized) {
                                                        setIsMinimized(false);
                                                    } else {
                                                        navigate(item.path);
                                                        !isDesktop && setIsOpen(false);
                                                    }
                                                }}
                                            >
                                                <Icon className="h-4 w-4 group-hover:text-red-500 transition-colors" />
                                                {!isMinimized && (
                                                    <span className="group-hover:text-red-500 transition-colors">{item.label}</span>
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </nav>

                    {!isMinimized && <Separator className="my-4" />}

                    {user?.isApproved && (
                        <div className="flex-1 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent hover:scrollbar-thumb-primary/20">
                            <div className="relative">
                                {!isMinimized ? (
                                    // Existing full-width view
                                    <div className="flex items-center gap-2 px-2 mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
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
                                ) : (
                                    // Minimized view - just the icon
                                    <div className="flex justify-center mb-4">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-primary animate-pulse" />
                                        </div>
                                    </div>
                                )}

                                <div className={cn("mb-16", isMinimized && "flex flex-col items-center gap-2")}>
                                    {users.filter(u => u.uid !== user.uid).slice(0, 3).map((user) => (
                                        <div
                                            key={user.uid}
                                            className={cn(
                                                "group transition-all duration-300 cursor-pointer",
                                                isMinimized ? "p-1" : "flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                                            )}
                                            onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                                        >
                                            <div className="relative">
                                                {isMinimized ? (
                                                    <TooltipProvider delayDuration={0}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Avatar className={cn(
                                                                    "border-2 border-primary/20 group-hover:border-primary/40 transition-colors ring-2 ring-offset-2 ring-offset-background ring-transparent group-hover:ring-primary/20",
                                                                    "h-10 w-10"
                                                                )}>
                                                                    <AvatarImage src={user?.photoURL} />
                                                                    <AvatarFallback className="bg-primary/10">
                                                                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="right"
                                                                className="flex flex-col gap-1 z-[99999]"
                                                                sideOffset={5}
                                                            >
                                                                <p className="font-medium">{user?.name || 'Anonymous'}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {user.isOnline ? 'Active now' : 'Offline'}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    // Existing Avatar code for non-minimized state
                                                    <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors ring-2 ring-offset-2 ring-offset-background ring-transparent group-hover:ring-primary/20">
                                                        <AvatarImage src={user?.photoURL} />
                                                        <AvatarFallback className="bg-primary/10">
                                                            {user?.name?.charAt(0) || user?.email?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'} ${user.isOnline ? 'animate-pulse' : ''}`} />
                                            </div>

                                            {!isMinimized && (
                                                // Existing user info for non-minimized state
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                        {user?.name || 'Anonymous'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground group-hover:text-primary/70">
                                                        {user.isOnline ? 'Active now' : 'Offline'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!isDesktop && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[9998]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
