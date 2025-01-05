import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { auth, db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from "./ui/input";
import { Home, Compass, Library, LogOut, Search, Menu } from 'lucide-react';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const Header = ({ user, onSearchResults }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme()

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data());
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    maxResults: 10,
                    key: YOUTUBE_API_KEY,
                    type: 'video',
                    q: searchQuery
                }
            });

            const videos = response.data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.default.url,
                channelTitle: item.snippet.channelTitle,
                duration: '3:45'
            }));

            onSearchResults(videos);
            navigate('/dashboard/search');
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Error searching videos:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo and Search Section */}
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3 transition-all duration-300">
                            <img
                                src="/images/minstrel-logo.png"
                                alt="MinstrelMuse Logo"
                                className={`${isMobile ? 'h-7 w-7' : isTablet ? 'h-8 w-8' : 'h-9 w-9'} cursor-pointer transform hover:scale-105 transition-transform duration-300`}
                            />
                            <h1
                                onClick={() => navigate('/')}
                                className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-all duration-300 bg-size-200 animate-gradient`}
                            >
                                {isMobile ? 'MinstrelMuse' : 'MinstrelMuse'}
                            </h1>
                        </div>

                        {/* Search Bar - Desktop and Tablet Only */}
                        {user && (isTablet || isDesktop) && (
                            <div className="transition-all duration-300">
                                <form onSubmit={handleSearch} className="flex items-center">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors duration-200" />
                                        <Input
                                            type="search"
                                            placeholder="Search music..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`${isTablet ? 'w-[180px]' : isDesktop ? 'w-[300px]' : 'w-[200px]'} pl-10 pr-4 py-2 rounded-full border-2 focus:border-purple-500 bg-background/50 hover:bg-background/80 transition-all duration-200`}
                                        />
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle and Navigation */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle - Always visible */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="relative p-2 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-full transition-colors duration-200"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            ) : (
                                <Moon className="h-5 w-5 text-purple-600" />
                            )}
                        </Button>

                        {/* Mobile Menu Button */}
                        {user && isMobile && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="relative p-2 hover:bg-purple-100 rounded-full transition-colors duration-200"
                            >
                                <Menu className="h-5 w-5 text-purple-600" />
                            </Button>
                        )}

                        {/* Desktop and Tablet Navigation */}
                        {user && (isTablet || isDesktop) && (
                            <nav className="hidden md:flex items-center gap-2">
                                {['Home', 'Discover', 'Library'].map((item, index) => (
                                    <Button
                                        key={index}
                                        variant="ghost"
                                        onClick={() => navigate(`/dashboard${item === 'Home' ? '' : `/${item.toLowerCase()}`}`)}
                                        className={`flex items-center gap-2 ${isTablet ? 'px-3 py-1.5' : 'px-4 py-2'} hover:bg-purple-100 dark:hover:bg-purple-900 rounded-full transition-all duration-200`}
                                    >
                                        {item === 'Home' ? <Home className="h-4 w-4" /> :
                                            item === 'Discover' ? <Compass className="h-4 w-4" /> :
                                                <Library className="h-4 w-4" />}
                                        <span>{item}</span>
                                    </Button>
                                ))}
                            </nav>
                        )}

                        {/* User Profile Section */}
                        <div className="flex items-center gap-3">
                            {user && (
                                <div
                                    onClick={() => navigate('/dashboard/profile')}
                                    className={`flex items-center gap-2 ${isMobile ? 'px-2 py-1.5' : isTablet ? 'px-2.5 py-1.5' : 'px-3 py-2'} rounded-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800 dark:hover:to-blue-800 cursor-pointer transition-all duration-300`}
                                >
                                    <Avatar className={`${isMobile ? 'h-6 w-6' : isTablet ? 'h-7 w-7' : 'h-8 w-8'} border-2 border-purple-200 dark:border-purple-700 transition-transform hover:scale-105`}>
                                        <AvatarImage
                                            src={user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.email}`}
                                            alt="User avatar"
                                        />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                                            {userProfile?.email?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {(isTablet || isDesktop) && (
                                        <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                                            {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0]}
                                        </span>
                                    )}
                                </div>
                            )}

                            {user && (
                                <Button
                                    variant="destructive"
                                    onClick={handleSignOut}
                                    className={`flex items-center gap-2 rounded-full hover:bg-red-600 transition-colors duration-200 ${isMobile ? 'px-2' : isTablet ? 'px-3' : 'px-4'}`}
                                >
                                    <LogOut className="h-4 w-4" />
                                    {(isTablet || isDesktop) && <span>Sign Out</span>}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobile && isMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg animate-slideDown">
                    <div className="container mx-auto p-4 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type="search"
                                placeholder="Search music..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 rounded-full"
                            />
                            <Button type="submit" variant="ghost" size="icon" className="rounded-full">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        <nav className="flex flex-col gap-2">
                            {['Home', 'Discover', 'Library'].map((item, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    onClick={() => {
                                        navigate(`/dashboard${item === 'Home' ? '' : `/${item.toLowerCase()}`}`);
                                        setIsMenuOpen(false);
                                    }}
                                    className="justify-start gap-3 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors duration-200"
                                >
                                    {item === 'Home' ? <Home className="h-4 w-4" /> :
                                        item === 'Discover' ? <Compass className="h-4 w-4" /> :
                                            <Library className="h-4 w-4" />}
                                    {item}
                                </Button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
