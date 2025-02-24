import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { auth } from '../config/firebase';
import { useMediaQuery } from 'react-responsive';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2, Youtube, Headphones, Radio, Sparkles, ArrowRight } from "lucide-react";

const MainPage = () => {
    const user = auth.currentUser;
    const [showCopyright, setShowCopyright] = useState(true);

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    return (
        <div className="min-h-screen flex items-center justify-center relative mt-[-6.6rem] overflow-hidden bg-white">
            <AnimatePresence>
                {showCopyright && (
                    <motion.div
                        className="fixed tracking-tighter inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4"
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
                                bg-white
                                border border-purple-500/20
                            `}>
                                <CardContent className="space-y-4 text-center relative">
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
                                        <p className={`text-black-200 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
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
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-white" />

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
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-75 animate-pulse" />
                    <Music2 className="h-16 w-16 md:h-24 md:w-24 text-white bg-gradient-to-r from-purple-600 to-blue-600 p-3 md:p-5 rounded-full relative" />
                </motion.div>

                <div className="relative">
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                        MinstrelMuse
                    </h1>

                    <div className="absolute -top-4 md:-top-6 left-1/4 animate-ping">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                    </div>
                    <div className="absolute -bottom-4 md:-bottom-6 right-1/4 animate-ping delay-300">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                    </div>
                </div>

                <p className="text-lg md:text-2xl text-muted-foreground tracking-tighter font-light">
                    Where Poetry Meets Melody in the Digital Age
                </p>

                <div className="flex items-center justify-center gap-4 pt-8">
                </div>
            </motion.div>
        </div>
    );
};

export default MainPage;
