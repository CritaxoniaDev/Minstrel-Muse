import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { auth } from '../config/firebase';
import { useMediaQuery } from 'react-responsive';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2, MessageCircle, Heart, Share2, Sparkles, ArrowRight } from "lucide-react";

const MainPageMinstrelHub = () => {
    const user = auth.currentUser;
    const [showWelcome, setShowWelcome] = useState(true);

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    return (
        <div className="min-h-screen flex items-center justify-center relative mt-[-6.6rem] overflow-hidden bg-background">
            <AnimatePresence>
                {showWelcome && (
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
                                ${isMobile ? 'p-4' : 'p-6'}
                                mx-auto
                                bg-card
                                border border-border
                            `}>
                                <CardContent className="space-y-4 text-center relative">
                                    {!isMobile && (
                                        <>
                                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-foreground/50" />
                                            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-foreground/50" />
                                            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-foreground/50" />
                                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-foreground/50" />
                                        </>
                                    )}

                                    <motion.div
                                        className={`flex justify-center ${isMobile ? 'space-x-4' : 'space-x-8'} mb-6`}
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                                            <MessageCircle className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-foreground`} />
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1, rotate: -5 }}>
                                            <Heart className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-foreground`} />
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                                            <Share2 className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-foreground`} />
                                        </motion.div>
                                    </motion.div>

                                    <div className="relative">
                                        {!isMobile && <Sparkles className="absolute -left-8 top-1/2 w-4 h-4 text-foreground animate-pulse" />}
                                        <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground`}>
                                            Welcome to MinstrelHub
                                        </h2>
                                        {!isMobile && <Sparkles className="absolute -right-8 top-1/2 w-4 h-4 text-foreground animate-pulse" />}
                                    </div>

                                    <div className="relative">
                                        <p className={`text-muted-foreground leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                                            Share your musical journey, connect with fellow music lovers,
                                            and discover new melodies in our community.
                                        </p>
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            className={`
                                                bg-primary text-primary-foreground hover:bg-primary/90
                                                ${isMobile ? 'mt-4' : 'mt-6'} 
                                                w-full relative group overflow-hidden
                                            `}
                                            onClick={() => setShowWelcome(false)}
                                        >
                                            <span className="relative z-10 flex items-center justify-center">
                                                Get Started
                                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-background" />

            <motion.div
                className="text-center z-10 space-y-4 md:space-y-6 p-4 md:p-8 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="relative inline-block"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute -inset-2 bg-primary rounded-full blur-lg opacity-75 animate-pulse" />
                    <Music2 className="h-16 w-16 md:h-24 md:w-24 text-primary-foreground bg-primary p-3 md:p-5 rounded-full relative" />
                </motion.div>

                <div className="relative">
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-foreground">
                        MinstrelHub
                    </h1>

                    <div className="absolute -top-4 md:-top-6 left-1/4 animate-ping">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-foreground" />
                    </div>
                    <div className="absolute -bottom-4 md:-bottom-6 right-1/4 animate-ping delay-300">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-foreground" />
                    </div>
                </div>

                <p className="text-lg md:text-2xl text-muted-foreground tracking-tighter font-light">
                    Your Musical Social Space
                </p>

                <div className="flex items-center justify-center gap-4 pt-8">
                    <Button 
                        className="bg-primary text-primary-foreground hover:bg-primary/90 group relative overflow-hidden"
                        size="lg"
                    >
                        <span className="relative z-10 flex items-center justify-center">
                            Start Sharing
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default MainPageMinstrelHub;
