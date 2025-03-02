import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LogOut, Search, Music2, User2, Menu } from 'lucide-react';
import { auth } from '../config/firebase';
import { useTheme } from 'next-themes';
import { useMediaQuery } from 'react-responsive';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '../config/youtube-api';
import { Card } from './ui/card';
import { cn } from "@/lib/utils";
import { ScrollArea } from './ui/scroll-area';

const Header = ({ user, onSearchResults, isOpen, setIsOpen }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
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
        while (attempts < 13) {
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
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3 group">
                        <div className="relative flex items-center gap-2">
                            {!isDesktop && user && (
                                <Button
                                    variant="ghost"
                                    className="p-2 hover:bg-primary/10"
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <Menu className="h-6 w-6" />
                                </Button>
                            )}
                            <div className="relative cursor-pointer" onClick={() => navigate('/dashboard')}>
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                                <div className="relative">
                                    <Music2 className="h-8 w-8 text-white bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 rounded-full" />
                                </div>
                            </div>
                        </div>
                        {!isMobile && (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                                MinstrelMuse
                            </h1>
                        )}
                    </div>

                    {user?.isApproved && (
                        <div ref={searchRef} className={cn(
                            "relative",
                            isMobile ? "w-full mx-2" : "flex-1 max-w-md mx-4"
                        )}>
                            <form onSubmit={handleFormSubmit}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder={isMobile ? "Search..." : "Search music..."}
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                                        className="w-full pl-10 pr-4 rounded-sm border-2 focus:border-purple-500 transition-all duration-300 bg-background/50 hover:bg-background/80"
                                    />
                                </div>
                            </form>

                            {showSuggestions && suggestions.length > 0 && (
                                <Card className={cn(
                                    "absolute mt-2 overflow-hidden border-2 border-muted",
                                    isMobile ? "w-[calc(100vw-2rem)] left-1/2 -translate-x-1/2" : "w-full"
                                )}>
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
                                                        {!isMobile && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {decodeHTMLEntities(suggestion.channelTitle)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </Card>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-4">
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
                        {!user ? (
                            <Button
                                variant="default"
                                className="rounded-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => navigate('/login')}
                            >
                                {!isMobile && "Login"}
                                <User2 className={cn("h-4 w-4", !isMobile && "ml-2")} />
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={handleSignOut}
                                className={cn(
                                    "rounded-sm border-destructive transition-all duration-300 group",
                                    "bg-destructive/5 hover:bg-destructive/10",
                                    "text-destructive dark:text-white",
                                    "hover:text-destructive dark:hover:text-white/90",
                                    "shadow-sm hover:shadow-md"
                                )}
                            >
                                <LogOut className="h-4 w-4 group-hover:animate-pulse" />
                                {!isMobile && <span className="ml-2">Sign Out</span>}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;