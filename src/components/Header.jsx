import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from "./ui/input";
import { Home, Compass, Library, LogOut, Search } from 'lucide-react';
import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const Header = ({ user, isApproved, onSearchResults }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

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
        } catch (error) {
            console.error('Error searching videos:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            if (user) {
                await updateDoc(doc(db, "users", user.uid), {
                    isApproved: false
                });
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
                    <div className="flex items-center gap-6">
                        <h1
                            onClick={() => navigate('/')}
                            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            YouPiFy
                        </h1>
                        
                        {user && isApproved && (
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search music..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-[300px] pl-8 bg-muted/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <Button type="submit" variant="ghost" size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </div>

                    {user ? (
                        <nav className="flex items-center gap-6">
                            {isApproved && (
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

                            <div className="flex items-center gap-4">
                                <div
                                    onClick={() => navigate('/dashboard/profile')}
                                    className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 cursor-pointer hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 transition-colors"
                                >
                                    <Avatar className="h-8 w-8 border-2 border-purple-200">
                                        <AvatarImage src={user.photoURL} />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                                            {user.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:block text-sm font-medium">
                                        {user.displayName || user.email.split('@')[0]}
                                    </span>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:block">Sign Out</span>
                                </Button>
                            </div>
                        </nav>
                    ) : (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sm">
                            <Link
                                to="/privacy"
                                className="text-muted-foreground hover:text-purple-600 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/data-deletion"
                                className="text-muted-foreground hover:text-purple-600 transition-colors"
                            >
                                Data Deletion
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
