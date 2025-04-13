import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LogOut, Search, Music2, User2, Menu, Mic, MicOff, Download } from 'lucide-react';
import { auth } from '../config/firebase';
import { useTheme } from 'next-themes';
import { useMediaQuery } from 'react-responsive';
import { Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '../config/youtube-api';
import { Card } from './ui/card';
import { cn } from "@/lib/utils";
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const Header = ({ user, onSearchResults, isOpen, setIsOpen }) => {
    const isMobileS = useMediaQuery({ maxWidth: 320 });
    const isMobileM = useMediaQuery({ minWidth: 321, maxWidth: 375 });
    const isMobileL = useMediaQuery({ minWidth: 376, maxWidth: 425 });
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const useIconOnly = isMobileS || isMobileM || isMobileL;
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);

    // Speech recognition states
    const [isListening, setIsListening] = useState(false);
    const [speechRecognition, setSpeechRecognition] = useState(null);

    const decodeHTMLEntities = (text) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    // In Header.jsx
    const [installable, setInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Update UI to notify the user they can add to home screen
            setInstallable(true);
        });

        window.addEventListener('appinstalled', () => {
            // Log install to analytics
            console.log('PWA was installed');
            setInstallable(false);
        });
    }, []);

    const handleInstallClick = () => {
        if (!deferredPrompt) {
            console.log("No installation prompt available");
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            // Clear the saved prompt since it can't be used again
            setDeferredPrompt(null);
        });
    };

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                // Trigger search suggestions when speech input is received
                if (transcript.trim()) {
                    fetchSuggestions(transcript);
                    setShowSuggestions(true);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            setSpeechRecognition(recognition);
        }
    }, []);

    const toggleSpeechRecognition = () => {
        if (!speechRecognition) return;

        if (isListening) {
            speechRecognition.stop();
            setIsListening(false);
        } else {
            speechRecognition.start();
            setIsListening(true);
        }
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
            <div className={cn(
                "container mx-auto",
                isMobileS ? "px-2" : isMobileM ? "px-3" : "px-4"
            )}>
                <div className={cn(
                    "flex items-center justify-between",
                    isMobileS ? "h-14" : isMobileM ? "h-14" : "h-16"
                )}>
                    <div className={cn(
                        "flex items-center group",
                        isMobileS ? "gap-2" : isMobileM ? "gap-2" : "gap-3"
                    )}>
                        <div className={cn(
                            "relative flex items-center",
                            isMobileS ? "gap-1" : isMobileM ? "gap-1.5" : "gap-2"
                        )}>
                            {!isDesktop && user && (
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "hover:bg-primary/10",
                                        isMobileS ? "p-1.5" : isMobileM ? "p-1.5" : "p-2"
                                    )}
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <Menu className={cn(
                                        isMobileS ? "h-5 w-5" : isMobileM ? "h-5 w-5" : "h-6 w-6"
                                    )} />
                                </Button>
                            )}
                            <div className="relative cursor-pointer" onClick={() => navigate('/dashboard')}>
                                <div className={cn(
                                    "absolute bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200",
                                    isMobileS ? "-inset-0.5" : isMobileM ? "-inset-0.5" : "-inset-1"
                                )}></div>
                                <div className="relative">
                                    <Music2 className={cn(
                                        "text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full",
                                        isMobileS ? "h-6 w-6 p-1" : isMobileM ? "h-7 w-7 p-1.5" : "h-8 w-8 p-1.5"
                                    )} />
                                </div>
                            </div>
                        </div>
                        {!isMobile && (
                            <h1 className={cn(
                                "font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform",
                                isMobileM ? "text-lg" : "text-xl"
                            )}>
                                MinstrelMuse
                            </h1>
                        )}
                    </div>

                    {user?.isApproved && (
                        <div ref={searchRef} className={cn(
                            "relative",
                            isMobileS ? "w-full mx-1" : isMobileM ? "w-full mx-1.5" : isMobile ? "w-full mx-2" : "flex-1 max-w-md mx-4"
                        )}>
                            <form onSubmit={handleFormSubmit}>
                                <div className="relative">
                                    <Search className={cn(
                                        "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                                        isMobileS ? "h-3 w-3 left-2" : isMobileM ? "h-3.5 w-3.5 left-2.5" : "h-4 w-4 left-3"
                                    )} />
                                    <Input
                                        type="search"
                                        placeholder={isMobile ? "Search..." : "Search music..."}
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                                        className={cn(
                                            "w-full rounded-sm border-2 focus:border-purple-500 transition-all duration-300 bg-background/50 hover:bg-background/80",
                                            isMobileS ? "h-8 text-xs pl-7 pr-8" :
                                                isMobileM ? "h-9 text-sm pl-8 pr-10" :
                                                    "pl-10 pr-12"
                                        )}
                                    />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "absolute right-1 top-1/2 -translate-y-1/2 rounded-full",
                                                        isListening ? "text-red-500 animate-pulse" : "text-muted-foreground",
                                                        isMobileS ? "h-6 w-6" : isMobileM ? "h-7 w-7" : "h-8 w-8"
                                                    )}
                                                    onClick={toggleSpeechRecognition}
                                                >
                                                    {isListening ?
                                                        <MicOff className={cn(
                                                            isMobileS ? "h-3 w-3" : isMobileM ? "h-3.5 w-3.5" : "h-4 w-4"
                                                        )} /> :
                                                        <Mic className={cn(
                                                            isMobileS ? "h-3 w-3" : isMobileM ? "h-3.5 w-3.5" : "h-4 w-4"
                                                        )} />
                                                    }
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{isListening ? "Stop voice search" : "Search with your voice"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </form>

                            {showSuggestions && suggestions.length > 0 && (
                                <Card className={cn(
                                    "absolute mt-2 overflow-hidden border-2 border-muted",
                                    isMobileS ? "w-[calc(100vw-1rem)] left-1/2 -translate-x-1/2" :
                                        isMobileM ? "w-[calc(100vw-1.5rem)] left-1/2 -translate-x-1/2" :
                                            isMobile ? "w-[calc(100vw-2rem)] left-1/2 -translate-x-1/2" : "w-full"
                                )}>
                                    <ScrollArea className={cn(
                                        isMobileS ? "max-h-[250px]" : isMobileM ? "max-h-[270px]" : "max-h-[300px]"
                                    )}>
                                        <div className={cn(
                                            "space-y-1",
                                            isMobileS ? "p-1.5" : isMobileM ? "p-1.5" : "p-2"
                                        )}>
                                            {suggestions.map((suggestion) => (
                                                <div
                                                    key={suggestion.id}
                                                    className={cn(
                                                        "flex items-center hover:bg-accent rounded-lg cursor-pointer group/item transition-all duration-200",
                                                        isMobileS ? "gap-2 p-1.5" : isMobileM ? "gap-2 p-1.5" : "gap-3 p-2"
                                                    )}
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
                                                            className={cn(
                                                                "object-cover transform group-hover/item:scale-110 transition-transform duration-200",
                                                                isMobileS ? "w-10 h-10" : isMobileM ? "w-10 h-10" : "w-12 h-12"
                                                            )}
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 group-hover/item:bg-black/0 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className={cn(
                                                            "font-medium line-clamp-1 group-hover/item:text-purple-600 transition-colors",
                                                            isMobileS ? "text-xs" : isMobileM ? "text-xs" : "text-sm"
                                                        )}>
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

                    <div className={cn(
                        "flex items-center",
                        isMobileS ? "gap-1" : isMobileM ? "gap-1.5" : "gap-2 sm:gap-4"
                    )}>
                        {installable && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={handleInstallClick}
                                            className={cn(
                                                useIconOnly ? "p-0" : "",
                                                isMobileS ? "h-8 w-8" :
                                                    isMobileM || isMobileL ? "h-9 w-9" :
                                                        "mr-2"
                                            )}
                                            variant={useIconOnly ? "ghost" : "default"}
                                            size={useIconOnly ? "icon" : "default"}
                                        >
                                            {useIconOnly ? (
                                                <Download className={cn(
                                                    "text-primary",
                                                    isMobileS ? "h-4 w-4" :
                                                        isMobileM ? "h-4.5 w-4.5" :
                                                            "h-5 w-5"
                                                )} />
                                            ) : (
                                                "Install App"
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {useIconOnly ? "Install App" : "Install as PWA"}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={cn(
                                "rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors",
                                isMobileS ? "h-8 w-8" : isMobileM ? "h-9 w-9" : ""
                            )}
                        >
                            {theme === 'dark' ? (
                                <Sun className={cn(
                                    "text-yellow-500",
                                    isMobileS ? "h-4 w-4" : isMobileM ? "h-4.5 w-4.5" : "h-5 w-5"
                                )} />
                            ) : (
                                <Moon className={cn(
                                    "text-purple-600",
                                    isMobileS ? "h-4 w-4" : isMobileM ? "h-4.5 w-4.5" : "h-5 w-5"
                                )} />
                            )}
                        </Button>

                        {!user ? (
                            <Button
                                variant="default"
                                className={cn(
                                    "rounded-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300",
                                    isMobileS ? "h-8 px-2.5" : isMobileM ? "h-8 px-3" : ""
                                )}
                                onClick={() => navigate('/login')}
                            >
                                {!isMobile && "Login"}
                                <User2 className={cn(
                                    isMobileS ? "h-3.5 w-3.5" : isMobileM ? "h-3.5 w-3.5" : "h-4 w-4",
                                    !isMobile && "ml-2"
                                )} />
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
                                    "shadow-sm hover:shadow-md",
                                    isMobileS ? "h-8 px-2.5" : isMobileM ? "h-8 px-3" : ""
                                )}
                            >
                                <LogOut className={cn(
                                    "group-hover:animate-pulse",
                                    isMobileS ? "h-3.5 w-3.5" : isMobileM ? "h-3.5 w-3.5" : "h-4 w-4"
                                )} />
                                {!isMobile && <span className="ml-2">Sign Out</span>}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Voice recognition status indicator */}
            {isListening && (
                <div className={cn(
                    "fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 dark:bg-white/20 backdrop-blur-md text-white rounded-full shadow-lg z-50 flex items-center gap-2 animate-pulse",
                    isMobileS ? "px-3 py-1.5" : isMobileM ? "px-3 py-1.5" : "px-4 py-2"
                )}>
                    <div className={cn(
                        "bg-red-500 rounded-full",
                        isMobileS ? "w-1.5 h-1.5" : isMobileM ? "w-1.5 h-1.5" : "w-2 h-2"
                    )}></div>
                    <span className={cn(
                        "font-medium",
                        isMobileS ? "text-xs" : isMobileM ? "text-xs" : "text-sm"
                    )}>
                        Listening...
                    </span>
                </div>
            )}
        </header>
    );
};

export default Header;