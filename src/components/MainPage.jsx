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
        <div className="min-h-screen flex items-center justify-center relative mt-[-6.6rem] overflow-hidden">
            <AnimatePresence>
                {showCopyright && (
                    <motion.div
                        className="fixed tracking-tighter inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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
                    bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-md border border-purple-500/20
                `}>
                                <CardContent className="space-y-4 text-center relative">
                                    {/* Corner decorations - hide on mobile */}
                                    {!isMobile && (
                                        <>
                                            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-purple-500/50" />
                                            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500/50" />
                                            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500/50" />
                                            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-purple-500/50" />
                                        </>
                                    )}

                                    {/* Icon row */}
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

                                    {/* Title */}
                                    <div className="relative">
                                        {!isMobile && <Sparkles className="absolute -left-8 top-1/2 w-4 h-4 text-purple-400 animate-pulse" />}
                                        <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent`}>
                                            Copyright Notice
                                        </h2>
                                        {!isMobile && <Sparkles className="absolute -right-8 top-1/2 w-4 h-4 text-blue-400 animate-pulse" />}
                                    </div>

                                    {/* Content */}
                                    <div className="relative">
                                        <p className={`text-black-200 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                                            This application integrates with YouTube and Google Firebase services.
                                            All content accessed through YouTube is subject to YouTube's Terms of Service
                                            and copyright policies.
                                        </p>
                                        <div className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
                                    </div>

                                    {/* Button */}
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
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Button>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Animated Drawing Grid Background */}
            <div className="absolute inset-0 [background-size:50px_50px] [mask-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [mask-size:50px_50px] animate-grid-fade-in">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />

                {/* Left-to-right horizontal beams */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={`hl-${i}`}
                        className="absolute h-[2px] w-[200px] animate-grid-beam-horizontal"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.8), transparent)',
                            top: `${Math.floor(Math.random() * 20) * 50}px`,
                            left: '0',
                            animationDelay: `${i * 1.5}s`
                        }}
                    />
                ))}

                {/* Right-to-left horizontal beams */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={`hr-${i}`}
                        className="absolute h-[2px] w-[200px] animate-grid-beam-horizontal"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.8), transparent)',
                            top: `${Math.floor(Math.random() * 20) * 50}px`,
                            right: '0',
                            transform: 'rotate(180deg)',
                            animationDelay: `${i * 1.5}s`
                        }}
                    />
                ))}

                {/* Left side vertical beams */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={`vl-${i}`}
                        className="absolute h-[200px] w-[2px] animate-grid-beam-vertical"
                        style={{
                            background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.8), transparent)',
                            left: `${Math.floor(Math.random() * 10) * 50}px`,
                            top: '0',
                            animationDelay: `${i * 1.5}s`
                        }}
                    />
                ))}

                {/* Right side vertical beams */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={`vr-${i}`}
                        className="absolute h-[200px] w-[2px] animate-grid-beam-vertical"
                        style={{
                            background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.8), transparent)',
                            right: `${Math.floor(Math.random() * 10) * 50}px`,
                            top: '0',
                            animationDelay: `${i * 1.5}s`
                        }}
                    />
                ))}

                <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,#4f4f4f1a_0px,#4f4f4f1a_1px,transparent_1px,transparent_50px)] animate-grid-slide-horizontal" />
                <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,#4f4f4f1a_0px,#4f4f4f1a_1px,transparent_1px,transparent_50px)] animate-grid-slide-vertical" />
            </div>

            {/* Animated Circles */}
            <div className="absolute inset-0 -z-10">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse
                            ${i === 0 ? 'bg-purple-300 h-72 w-72 -top-10 -left-10' : ''}
                            ${i === 1 ? 'bg-blue-300 h-96 w-96 top-20 right-12' : ''}
                            ${i === 2 ? 'bg-violet-300 h-72 w-72 bottom-20 left-20' : ''}
                        `}
                        style={{
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + i * 0.5}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <motion.div
                className="text-center z-10 space-y-6 backdrop-blur-[1px] p-8 rounded-2xl"
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
                    <Music2 className="h-24 w-24 text-white bg-gradient-to-r from-purple-600 to-blue-600 p-5 rounded-full relative" />
                </motion.div>

                <div className="relative">
                    {/* Decorative corner elements */}
                    <svg className="absolute -left-12 -top-8 w-12 h-12 text-purple-500 animate-pulse opacity-70">
                        <path d="M2 10 C2 10, 10 10, 10 2" stroke="currentColor" strokeWidth="2" fill="none">
                            <animate attributeName="d" dur="3s" repeatCount="indefinite"
                                values="M2 10 C2 10, 10 10, 10 2;M2 10 C2 6, 14 6, 10 2;M2 10 C2 10, 10 10, 10 2" />
                        </path>
                    </svg>

                    <svg className="absolute -right-12 -top-8 w-12 h-12 text-blue-500 animate-pulse opacity-70">
                        <path d="M10 10 C10 10, 2 10, 2 2" stroke="currentColor" strokeWidth="2" fill="none">
                            <animate attributeName="d" dur="3s" repeatCount="indefinite"
                                values="M10 10 C10 10, 2 10, 2 2;M10 10 C10 6, -2 6, 2 2;M10 10 C10 10, 2 10, 2 2" />
                        </path>
                    </svg>

                    {/* Musical note decorations */}
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2">
                        <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                                fill="currentColor">
                                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
                            </path>
                        </svg>
                    </div>

                    <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                        <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                                fill="currentColor">
                                <animate attributeName="opacity" values="0.7;0.3;0.7" dur="4s" repeatCount="indefinite" />
                            </path>
                        </svg>
                    </div>

                    <h1 className="text-7xl font-bold tracking-tighter bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                        MinstrelMuse
                    </h1>

                    {/* Animated underline */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-48 h-1">
                        <svg className="w-full h-full">
                            <line x1="0" y1="0" x2="100%" y2="0" stroke="url(#gradient)" strokeWidth="2">
                                <animate attributeName="stroke-dasharray" values="0 100%;100% 0" dur="3s" repeatCount="indefinite" />
                            </line>
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="100%" y2="0">
                                    <stop offset="0%" stopColor="#9333ea">
                                        <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="50%" stopColor="#3b82f6">
                                        <animate attributeName="offset" values="0.5;1.5;0.5" dur="3s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="100%" stopColor="#9333ea">
                                        <animate attributeName="offset" values="1;2;1" dur="3s" repeatCount="indefinite" />
                                    </stop>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Sparkle effects */}
                    <div className="absolute -top-6 left-1/4 animate-ping">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="absolute -bottom-6 right-1/4 animate-ping delay-300">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                </div>


                <p className="text-2xl text-muted-foreground tracking-tighter font-light">
                    Where Poetry Meets Melody in the Digital Age
                </p>

                <div className="flex items-center justify-center gap-4 pt-8">
                    {/* <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="backdrop-blur-md bg-opacity-20">
                        Learn More
                    </Button> */}
                </div>
            </motion.div>
        </div>
    );
};

export default MainPage;
