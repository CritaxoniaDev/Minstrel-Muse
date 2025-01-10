import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LogOut, Search } from 'lucide-react';
import { auth } from '../config/firebase';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '../config/youtube-api';

const Header = ({ user, onSearchResults }) => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        let attempts = 0;
        while (attempts < 11) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 10,
                        key: getYoutubeApiKey(),
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
                break;
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error searching videos:', error);
                    break;
                }
            }
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
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/minstrel-logo.png"
                            alt="MinstrelMuse Logo"
                            className="h-8 w-8 cursor-pointer"
                            onClick={() => navigate('/')}
                        />
                        <h1
                            onClick={() => navigate('/')}
                            className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                        >
                            MinstrelMuse
                        </h1>
                    </div>

                    {/* Search Bar */}
                    {user && (
                        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search music..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 rounded-full"
                                />
                            </div>
                        </form>
                    )}

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-full"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </Button>

                        {user && (
                            <Button
                                variant="destructive"
                                onClick={handleSignOut}
                                className="rounded-full"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
