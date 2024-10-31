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

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const Header = ({ user, isApproved, onSearchResults }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();
                if (userData.role !== "admin") {
                    await updateDoc(doc(db, "users", user.uid), {
                        isApproved: false
                    });
                }
            }
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
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/minstrel-logo.png"
                            alt="MinstrelMuse Logo"
                            className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} cursor-pointer`}
                        />
                        <h1
                            onClick={() => navigate('/')}
                            className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                            {isMobile ? 'MinstrelMuse' : 'MinstrelMuse'}
                        </h1>
                    </div>

                    {/* Search and Navigation */}
                    {user && isApproved && (
                        <>
                            {isMobile ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="md:hidden"
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            ) : (
                                <form onSubmit={handleSearch} className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search music..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`${isTablet ? 'w-[200px]' : 'w-[300px]'} pl-8 bg-muted/50 focus:bg-background transition-colors`}
                                        />
                                    </div>
                                    <Button type="submit" variant="ghost" size="icon">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </form>
                            )}
                        </>
                    )}

                    {/* Mobile Menu */}
                    {isMobile && isMenuOpen && (
                        <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg p-4 space-y-4">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <Input
                                    type="search"
                                    placeholder="Search music..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full"
                                />
                                <Button type="submit" variant="ghost" size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            <div className="flex flex-col gap-2">
                                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}>
                                    <Home className="h-4 w-4 mr-2" /> Home
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/dashboard/discover'); setIsMenuOpen(false); }}>
                                    <Compass className="h-4 w-4 mr-2" /> Discover
                                </Button>
                                <Button variant="ghost" className="justify-start" onClick={() => { navigate('/dashboard/library'); setIsMenuOpen(false); }}>
                                    <Library className="h-4 w-4 mr-2" /> Library
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* User Navigation */}
                    {user && (
                        <nav className={`flex items-center ${isMobile ? 'gap-2' : 'gap-6'}`}>
                            {isApproved && !isMobile && (
                                <div className="hidden md:flex items-center gap-1">
                                    <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
                                        <Home className="h-4 w-4" />
                                        <span>Home</span>
                                    </Button>
                                    <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/dashboard/discover')}>
                                        <Compass className="h-4 w-4" />
                                        <span>Discover</span>
                                    </Button>
                                    <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/dashboard/library')}>
                                        <Library className="h-4 w-4" />
                                        <span>Library</span>
                                    </Button>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <div
                                    onClick={() => navigate('/dashboard/profile')}
                                    className={`flex items-center gap-2 px-${isMobile ? '2' : '4'} py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 cursor-pointer hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 transition-colors`}
                                >
                                    <Avatar className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} border-2 border-purple-200`}>
                                        <AvatarImage src={userProfile?.photoURL || ''} alt={userProfile?.name || 'User'} />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                                            {userProfile?.email?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!isMobile && (
                                        <span className="hidden md:block text-sm font-medium">
                                            {user?.displayName || user?.email?.split('@')[0]}
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {!isMobile && <span className="hidden md:block">Sign Out</span>}
                                </Button>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
