import { useState, useEffect } from 'react';
import { db } from "@/config/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Home, Compass, Library, Users, Settings, Music2, Menu, Shield, Download, Users2, BarChart3, Database, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
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

const Sidebar = ({ user, isMinimized, setIsMinimized, isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [playlistCount, setPlaylistCount] = useState(0);
    const [users, setUsers] = useState([]);

    // Regular user menu items (basic access)
    const userMenuItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Library, label: 'Library', path: '/dashboard/library' }
    ];

    // Moderator menu items (only social and youtube downloader)
    const moderatorMenuItems = [
        { icon: Users, label: 'Social', path: '/dashboard/social' },
        { icon: Download, label: 'YouTube Downloader', path: '/dashboard/youtube-downloader' }
    ];

    // Admin menu items (full access)
    const adminMenuItems = [
        { icon: Shield, label: 'Admin Panel', path: '/dashboard/admin' },
        { icon: Users2, label: 'User Management', path: '/dashboard/admin/users' },
    ];

    // Determine which menu items to show based on user role
    let visibleMenuItems = [];
    
    if (user?.isApproved) {
        // Base items for all users
        visibleMenuItems = [...userMenuItems];
        
        // Add moderator items if user is moderator or admin
        if (user?.role === 'moderator' || user?.role === 'admin') {
            visibleMenuItems = [...visibleMenuItems, ...moderatorMenuItems];
        }
    }
    
    // Admin-only items
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

            <div className={cn(
                "fixed left-0 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30 transition-all duration-300 ease-in-out z-[9999]",
                // For desktop: respect the isMinimized state
                isDesktop ? (isMinimized ? "w-20" : "w-64") : "w-64",
                // For mobile: handle slide in/out without minimizing
                isDesktop ? "translate-x-0" : isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className={cn(
                    "px-6 py-2 space-y-4",
                    // Only apply minimized padding on desktop
                    isDesktop && isMinimized && "p-2"
                )}>
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
                                    // Only minimize profile image on desktop
                                    isDesktop && isMinimized ? "h-10 w-10" : "h-[5.1rem] w-[5.1rem]"
                                )}
                                onClick={() => navigate(`/dashboard/profile/${user.uid}`)}
                            />
                            {/* Show status badge when not minimized or on mobile */}
                            {(!isMinimized || !isDesktop) && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                    <Music2 className="h-3 w-3" />
                                    {user?.role === 'admin' ? 'Admin' : user?.role === 'moderator' ? 'Moderator' : 'Online'}
                                </div>
                            )}
                        </div>
                        {/* Show user info when not minimized or on mobile */}
                        {(!isMinimized || !isDesktop) && (
                            <div className="text-center tracking-tighter">
                                <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                        )}
                    </div>

                    {(!isMinimized || !isDesktop) && <Separator className="my-4" />}

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
                                            isDesktop && isMinimized ? "px-2 justify-center" : "justify-start gap-2",
                                            window.location.pathname === item.path &&
                                            "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-500"
                                        )}
                                        onClick={() => {
                                            navigate(item.path);
                                            !isDesktop && setIsOpen(false);
                                        }}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {(!isMinimized || !isDesktop) && item.label}
                                    </Button>
                                );
                            })}
                        </div>

                        {(!isMinimized || !isDesktop) && <Separator className="my-4" />}

                        {user?.role === 'admin' && (
                            <>
                                {(!isMinimized || !isDesktop) && (
                                    <div className="px-3 mb-2">
                                        <h2 className="text-sm font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                            Admin Dashboard
                                        </h2>
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
                                                    isDesktop && isMinimized ? "px-2 justify-center" : "justify-start",
                                                    window.location.pathname === item.path &&
                                                    "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-500"
                                                )}
                                                onClick={() => {
                                                    navigate(item.path);
                                                    !isDesktop && setIsOpen(false);
                                                }}
                                            >
                                                <Icon className="h-4 w-4 group-hover:text-red-500 transition-colors" />
                                                {(!isMinimized || !isDesktop) && (
                                                    <span className="group-hover:text-red-500 transition-colors">{item.label}</span>
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </nav>
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
