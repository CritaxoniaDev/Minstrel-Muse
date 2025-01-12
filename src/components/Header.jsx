import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LogOut, Search, Music2, User2 } from 'lucide-react';
import { auth } from '../config/firebase';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '../config/youtube-api';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

const Header = ({ user, onSearchResults }) => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    const decodeHTMLEntities = (text) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        let attempts = 0;
        while (attempts < 11) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 8, // Increased for more suggestions
                        key: getYoutubeApiKey(),
                        type: 'video',
                        q: `${query} music`, // Added 'music' to improve relevance
                        videoCategoryId: '10', // Music category
                        relevanceLanguage: 'en',
                        safeSearch: 'none'
                    }
                });

                const suggestions = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.default.url,
                    channelTitle: item.snippet.channelTitle,
                    description: item.snippet.description
                }));

                setSuggestions(suggestions);
                break;
            } catch (error) {
                if (error?.response?.status === 403 || error?.response?.status === 429) {
                    rotateApiKey();
                    attempts++;
                } else {
                    console.error('Error fetching suggestions:', error);
                    break;
                }
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        let attempts = 0;
        while (attempts < 11) {
            try {
                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        maxResults: 20, // Increased for more comprehensive results
                        key: getYoutubeApiKey(),
                        type: 'video',
                        q: `${searchQuery} music`,
                        videoCategoryId: '10',
                        relevanceLanguage: 'en',
                        safeSearch: 'none',
                        order: 'relevance'
                    }
                });

                const videos = response.data.items.map(item => ({
                    id: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.high.url, // Using higher quality thumbnails
                    channelTitle: item.snippet.channelTitle,
                    description: item.snippet.description,
                    publishedAt: item.snippet.publishedAt
                }));

                onSearchResults(videos);
                setSearchQuery('');
                setShowSuggestions(false);
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

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch(e);
    };

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (!value.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
        } else {
            setShowSuggestions(true);
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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                fetchSuggestions(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                            <div className="relative">
                                <Music2 className="h-8 w-8 text-white bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 rounded-full" />
                            </div>
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                            MinstrelMuse
                        </h1>
                    </div>

                    {user && (
                        <div ref={searchRef} className="flex-1 max-w-md mx-4 relative">
                            <form onSubmit={handleFormSubmit}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search music..."
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                                        className="w-full pl-10 pr-4 rounded-full border-2 focus:border-purple-500 transition-all duration-300 bg-background/50 hover:bg-background/80"
                                    />
                                </div>
                            </form>

                            {showSuggestions && suggestions.length > 0 && (
                                <Card className="absolute w-full mt-2 overflow-hidden border-2 border-muted">
                                    <ScrollArea className="max-h-[300px]">
                                        <div className="p-2 space-y-1">
                                            {suggestions.map((suggestion) => (
                                                <div
                                                    key={suggestion.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer group/item transition-all duration-200"
                                                    onClick={() => {
                                                        setSearchQuery(suggestion.title);
                                                        setShowSuggestions(false);
                                                        onSearchResults([suggestion]);
                                                        navigate('/dashboard/search');
                                                    }}
                                                >
                                                    <div className="relative rounded-md overflow-hidden">
                                                        <img
                                                            src={suggestion.thumbnail}
                                                            alt=""
                                                            className="w-12 h-12 object-cover transform group-hover/item:scale-110 transition-transform duration-200"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/0 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm font-medium line-clamp-1 group-hover/item:text-purple-600 transition-colors">
                                                            {decodeHTMLEntities(suggestion.title)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {decodeHTMLEntities(suggestion.channelTitle)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </Card>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 text-yellow-500" />
                            ) : (
                                <Moon className="h-5 w-5 text-purple-600" />
                            )}
                        </Button>
                        {!user && (
                            <Button
                                variant="default"
                                className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => navigate('/login')}
                            >
                                Login
                                <User2 className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        {user && (
                            <Button
                                variant="default"
                                onClick={handleSignOut}
                                className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
