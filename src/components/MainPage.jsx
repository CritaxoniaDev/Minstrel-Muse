import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { auth } from '../config/firebase';
import { useMediaQuery } from 'react-responsive';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MorphingText } from "@/components/magicui/morphing-text";
import { Music2, Youtube, Headphones, Radio, Sparkles, ArrowRight, Music, Video, Mic, Bookmark, Share2, Heart } from "lucide-react";
import { useTheme } from 'next-themes';
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import Lottie from 'lottie-react';
import lazyLoadingAnimation from '/public/lottie/lazy-loading.json';

const MainPage = () => {
    const { theme } = useTheme();
    const user = auth.currentUser;
    const [showCopyright, setShowCopyright] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    useEffect(() => {
        // Show loading animation for 2 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
                <div className="w-32 h-32">
                    <Lottie animationData={lazyLoadingAnimation} loop={true} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden bg-background w-full">
            <AnimatePresence>
                {showCopyright && (
                    <motion.div
                        className="fixed tracking-tighter inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            exit={{ y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full"
                        >
                            <Card className={`
                        w-full 
                        ${isMobile ? 'max-w-[95%]' : isTablet ? 'max-w-[600px]' : 'max-w-[500px]'}
                        mx-auto
                        bg-card
                        border border-border
                        relative
                        overflow-hidden
                        shadow-lg
                    `}>
                                {/* Card decorative elements */}
                                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.1]"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>

                                <CardContent className={`space-y-4 text-center relative ${isMobile ? 'p-4' : 'p-6'}`}>
                                    {!isMobile && (
                                        <>
                                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-purple-500/50" />
                                            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500/50" />
                                            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500/50" />
                                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-purple-500/50" />
                                        </>
                                    )}

                                    <motion.div
                                        className={`flex justify-center ${isMobile ? 'space-x-4' : 'space-x-8'} mb-6`}
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                                            <Youtube className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-red-500`} />
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1, rotate: -5 }}>
                                            <Headphones className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-purple-500`} />
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                                            <Radio className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-blue-500`} />
                                        </motion.div>
                                    </motion.div>

                                    <div className="relative">
                                        {!isMobile && <Sparkles className="absolute -left-8 top-1/2 w-4 h-4 text-purple-400 animate-pulse" />}
                                        <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent`}>
                                            Copyright Notice
                                        </h2>
                                        {!isMobile && <Sparkles className="absolute -right-8 top-1/2 w-4 h-4 text-blue-400 animate-pulse" />}
                                    </div>

                                    <div className="relative">
                                        <p className={`text-foreground leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                                            This application integrates with YouTube and Google Firebase services.
                                            All content accessed through YouTube is subject to YouTube's Terms of Service
                                            and copyright policies.
                                        </p>
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            className={`
                                        bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90
                                        ${isMobile ? 'mt-4' : 'mt-6'}
                                        w-full relative group overflow-hidden
                                    `}
                                            onClick={() => setShowCopyright(false)}
                                        >
                                            <span className="relative z-10 flex items-center justify-center">
                                                I Understand
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                            <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-200"></span>
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section - Full width */}
            <motion.div
                className="text-center z-10 w-full pt-20 pb-12 md:pb-16 relative px-4 md:px-6 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background z-10"></div>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute w-full h-full object-cover opacity-50 dark:opacity-30" // Increased opacity
                        style={{ minHeight: '70vh' }} // Ensure minimum height
                    >
                        <source src="/videos/bg-video-mainpage.mp4" type="video/mp4" />
                        {/* Fallback image if video doesn't load */}
                        <img
                            src="/images/music-background-fallback.jpg"
                            alt="Music background"
                            className="absolute w-full h-full object-cover"
                        />
                    </video>
                </div>
                {/* Hero decorative elements */}
                <div className="absolute -left-4 animate-ping">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                </div>
                <div className="relative pb-10 max-w-4xl mx-auto">
                    <div className="absolute -inset-1"></div>
                    <MorphingText
                        className="text-4xl md:text-5xl font-bold tracking-tighter mx-auto relative"
                        texts={[
                            "MinstrelMuse",
                            "Harmonious",
                            "Enchanting",
                            "Boundless",
                            "Ethereal",
                            "Timeless",
                            "Euphoric",
                            "Infinite",
                        ]}
                    />
                </div>
                <div className="absolute -right-4 animate-ping">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                </div>
                <p className="text-lg md:text-2xl text-muted-foreground tracking-tighter font-light mb-8 md:mb-10 relative max-w-4xl mx-auto">
                    Where Poetry Meets Melody in the Digital Age
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></span>
                </p>
                <div className="flex items-center justify-center">
                    <Button
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 relative group overflow-hidden"
                        size="lg"
                    >
                        <span className="relative z-10 flex items-center justify-center">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-200"></span>
                    </Button>
                </div>
            </motion.div>

            {/* Features Section - Full width */}
            <motion.div
                className="w-full px-4 md:px-8 py-16 md:py-24 z-10 relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                {/* Section decorative elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent relative">
                        Discover Our Features
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                    </h2>

                    <BentoGrid className={`${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'} gap-4 md:gap-6 auto-rows-[18rem] md:auto-rows-[22rem]`}>
                        <BentoCard
                            name="YouTube Integration"
                            className="col-span-1 md:col-span-1 relative group"
                            background={
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 opacity-70" />
                                    <div className="absolute inset-0 bg-[radial-gradient(#f87171_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-[0.15]"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </>
                            }
                            Icon={Youtube}
                            description="Seamlessly access and play your favorite YouTube music videos."
                            href="#youtube-integration"
                            cta="Learn More"
                        />

                        <BentoCard
                            name="Playlist Creation"
                            className="col-span-1 md:col-span-1 relative group"
                            background={
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 opacity-70" />
                                    <div className="absolute inset-0 bg-[radial-gradient(#c084fc_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-[0.15]"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </>
                            }
                            Icon={Music}
                            description="Create and manage custom playlists from your favorite tracks."
                            href="#playlist-creation"
                            cta="Explore"
                        />

                        <BentoCard
                            name="Audio Extraction"
                            className="col-span-1 md:col-span-1 relative group"
                            background={
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 opacity-70" />
                                    <div className="absolute inset-0 bg-[radial-gradient(#60a5fa_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-[0.15]"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </>
                            }
                            Icon={Headphones}
                            description="Listen to just the audio from your favorite videos."
                            href="#audio-extraction"
                            cta="Try Now"
                        />
                        <BentoCard
                            name="Offline Listening"
                            className="col-span-1 md:col-span-1 relative group"
                            background={
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-green-600/20 opacity-70" />
                                    <div className="absolute inset-0 bg-[radial-gradient(#4ade80_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-[0.15]"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </>
                            }
                            Icon={Bookmark}
                            description="Save your music for offline enjoyment anytime, anywhere."
                            href="#offline-listening"
                            cta="Get Started"
                        />

                        <BentoCard
                            name="Social Sharing"
                            className="col-span-1 md:col-span-1 relative group"
                            background={
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 opacity-70" />
                                    <div className="absolute inset-0 bg-[radial-gradient(#fbbf24_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-[0.15]"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/50 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </>
                            }
                            Icon={Share2}
                            description="Share your favorite tracks and playlists with friends."
                            href="#social-sharing"
                            cta="Share Now"
                        />

                        <BentoCard
                            name="Favorites Collection"
                            className="col-span-1 md:col-span-1 relative group"
                            background={
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-600/20 opacity-70" />
                                    <div className="absolute inset-0 bg-[radial-gradient(#f472b6_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-[0.15]"></div>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500/50 to-transparent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                                </>
                            }
                            Icon={Heart}
                            description="Keep track of your most loved songs in your favorites collection."
                            href="#favorites-collection"
                            cta="View Favorites"
                        />
                    </BentoGrid>
                </div>
            </motion.div>

            {/* CTA Section - Full width */}
            <motion.div
                className="w-full px-4 md:px-8 py-16 md:py-20 z-10 text-center relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                {/* CTA decorative elements */}
                <div className="absolute -z-10 inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(168,85,247,0.1)_360deg)] animate-slow-spin"></div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden">
                        {/* Card decorative elements */}
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.1]"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>

                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500/30"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500/30"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500/30"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-500/30"></div>

                        <h2 className="text-2xl md:text-3xl font-bold mb-6 relative inline-block">
                            Ready to transform your music experience?
                            <span className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></span>
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join thousands of music lovers who have discovered a new way to enjoy their favorite tunes.
                            MinstrelMuse brings you the best of YouTube's vast music library in an elegant,
                            user-friendly interface designed for music enthusiasts.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 w-full sm:w-auto relative group overflow-hidden"
                                size="lg"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    Sign Up Now
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </span>
                                <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-200"></span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto group relative overflow-hidden"
                                size="lg"
                            >
                                <span className="relative z-10">Learn More</span>
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Footer - Full width */}
            <footer className="w-full py-8 border-t border-border mt-auto z-10 bg-background/50 backdrop-blur-sm relative">
                {/* Footer decorative elements */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]"></div>
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <div className="flex justify-center space-x-6 mb-6">
                        <motion.div whileHover={{ scale: 1.1, y: -2 }} className="relative">
                            <div className="absolute -inset-1 bg-red-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Youtube className="h-5 w-5 text-red-500 relative" />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1, y: -2 }} className="relative">
                            <div className="absolute -inset-1 bg-purple-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Headphones className="h-5 w-5 text-purple-500 relative" />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1, y: -2 }} className="relative">
                            <div className="absolute -inset-1 bg-blue-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Music className="h-5 w-5 text-blue-500 relative" />
                        </motion.div>
                    </div>
                    <p className="font-medium">© {new Date().getFullYear()} MinstrelMuse. All rights reserved.</p>
                    <p className="mt-2 max-w-lg mx-auto">
                        This application is not affiliated with YouTube or Google. All YouTube content is subject to YouTube's Terms of Service.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;

