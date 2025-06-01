import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { auth } from '../config/firebase';
import { useMediaQuery } from 'react-responsive';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MorphingText } from "@/components/magicui/morphing-text";
import {
    Music2, Youtube, Headphones, Radio, Sparkles, ArrowRight,
    Music, Video, Mic, Bookmark, Share2, Heart, ChevronDown,
    BarChart3, Shield, Globe, Zap, CheckCircle, Users
} from "lucide-react";
import { useTheme } from 'next-themes';
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import Lottie from 'lottie-react';
import lazyLoadingAnimation from '/src/lottie/lazy-loading.json';
import analyticsAnimation from '/src/lottie/analytics.json';
import musicAnimation from '/src/lottie/music-notes.json';
import securityAnimation from '/src/lottie/security.json';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const { theme } = useTheme();
    const user = auth.currentUser;
    const [showCopyright, setShowCopyright] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Responsive breakpoints
    const isMobileS = useMediaQuery({ maxWidth: 320 });
    const isMobileM = useMediaQuery({ minWidth: 321, maxWidth: 375 });
    const isMobileL = useMediaQuery({ minWidth: 376, maxWidth: 425 });
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    // Refs for scroll animations
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const statsRef = useRef(null);
    const testimonialsRef = useRef(null);
    const pricingRef = useRef(null);

    // Scroll animations
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.2]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    useEffect(() => {
        // Show loading animation for 2 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
    };

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
                ${isMobileS ? 'max-w-[95%]' : isTablet ? 'max-w-[600px]' : 'max-w-[500px]'}
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

            <section
                ref={heroRef}
                className="w-full flex flex-col items-center justify-center relative overflow-hidden"
            >
                {/* Background video */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background z-10"></div>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute w-full h-full object-cover opacity-50 dark:opacity-30"
                >
                    <source src="/videos/bg-video-mainpage.mp4" type="video/mp4" />
                    {/* Fallback image if video doesn't load */}
                    <img
                        src="/images/music-background-fallback.jpg"
                        alt="Music background"
                        className="absolute w-full h-full object-cover"
                    />
                </video>

                {/* Background elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1)_0,rgba(255,255,255,0)_100%)]"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>
                </div>

                {/* Hero content */}
                <motion.div
                    className="container px-4 pt-40 md:px-6 flex flex-col items-center text-center z-10 max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ opacity, scale }}
                >
                    <div className="inline-flex items-center justify-center px-3 py-1 mb-8 text-sm font-medium rounded-full bg-muted/50 text-foreground/80 ring-1 ring-border backdrop-blur-sm">
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        <span>Enterprise-grade Music Experience</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
                        <span className="text-black dark:text-white">Transform Your Music </span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600">
                            Experience
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-12">
                        Discover a new way to enjoy your favorite music with our powerful, intuitive platform designed for serious music enthusiasts.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                        <Button
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 relative group overflow-hidden"
                            size="lg"
                            onClick={() => navigate('/dashboard')}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                            <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-200"></span>
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => scrollToSection(featuresRef)}
                            className="group"
                        >
                            <span>Explore Features</span>
                            <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
                        </Button>
                    </div>

                    {/* Hero animation */}
                    <motion.div
                        className="w-full max-w-2xl mx-auto"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div className="relative aspect-video rounded-xl overflow-hidden">

                        </div>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    >
                        <ChevronDown className="h-6 w-6 text-muted-foreground" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Animated Feature Showcase */}
            <section className="w-full py-20 md:py-28 relative">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.05)_0,rgba(255,255,255,0)_100%)]"></div>
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            className="order-2 lg:order-1"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600">
                                Advanced Analytics Dashboard
                            </h2>
                            <p className="text-xl text-muted-foreground mb-6">
                                Gain deep insights into your music consumption patterns with our enterprise-grade analytics platform.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Track listening habits and preferences over time",
                                    "Discover new music based on sophisticated algorithms",
                                    "Visualize your music journey with interactive charts",
                                    "Export detailed reports for business intelligence"
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        className="flex items-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.1 * i }}
                                    >
                                        <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                            <Button
                                className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                                size="lg"
                            >
                                Explore Analytics
                            </Button>
                        </motion.div>

                        <motion.div
                            className="order-1 lg:order-2 relative"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative aspect-square md:aspect-video lg:aspect-square max-w-md mx-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-sm opacity-50"></div>
                                <div className="relative bg-card border border-border rounded-lg overflow-hidden shadow-xl">
                                    <Lottie animationData={analyticsAnimation} loop={true} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Security Feature Showcase */}
            <section className="w-full py-20 md:py-28 bg-muted/30 relative">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="relative aspect-square md:aspect-video lg:aspect-square max-w-md mx-auto">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur-sm opacity-50"></div>
                                <div className="relative bg-card border border-border rounded-lg overflow-hidden shadow-xl">
                                    <Lottie animationData={securityAnimation} loop={true} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-blue-500 to-green-600">
                                Enterprise-Grade Security
                            </h2>
                            <p className="text-xl text-muted-foreground mb-6">
                                Protect your data and privacy with our comprehensive security infrastructure.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "End-to-end encryption for all your music data",
                                    "Compliance with global data protection regulations",
                                    "Advanced authentication and access controls",
                                    "Regular security audits and penetration testing"
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        className="flex items-start"
                                        initial={{ opacity: 0, x: 10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.1 * i }}
                                    >
                                        <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                            <Button
                                className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90"
                                size="lg"
                            >
                                Learn About Security
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Enterprise Footer */}
            <footer className="w-full bg-background border-t border-border mt-auto z-10 relative">
                <div className="container mx-auto px-4 py-16">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                        <Music className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        MinstrelMuse
                                    </span>
                                </div>
                            </div>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                Enterprise-grade music platform delivering advanced analytics, security, and seamless integration for businesses and music enthusiasts worldwide.
                            </p>
                            <div className="flex space-x-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-2 bg-red-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Youtube className="h-6 w-6 text-red-500 relative" />
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-2 bg-purple-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Headphones className="h-6 w-6 text-purple-500 relative" />
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Music className="h-6 w-6 text-blue-500 relative" />
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute -inset-2 bg-green-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Globe className="h-6 w-6 text-green-500 relative" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4 flex items-center">
                                <Zap className="h-4 w-4 mr-2 text-purple-500" />
                                Product
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Dashboard',
                                    'Analytics',
                                    'Music Library',
                                    'Playlists',
                                    'API Access',
                                    'Mobile App'
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        whileHover={{ x: 4 }}
                                        className="transition-colors duration-200"
                                    >
                                        <a href="#" className="text-muted-foreground hover:text-purple-500 text-sm">
                                            {item}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Enterprise Links */}
                        <div>
                            <h3 className="font-semibold text-foreground mb-4 flex items-center">
                                <Users className="h-4 w-4 mr-2 text-blue-500" />
                                Enterprise
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Enterprise Plans',
                                    'Team Management',
                                    'SSO Integration',
                                    'Custom Analytics',
                                    'Priority Support',
                                    'SLA Agreements'
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        whileHover={{ x: 4 }}
                                        className="transition-colors duration-200"
                                    >
                                        <a href="#" className="text-muted-foreground hover:text-blue-500 text-sm">
                                            {item}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter Subscription */}
                    <div className="border-t border-border pt-8 mb-8">
                        <div className="max-w-md mx-auto text-center">
                            <h3 className="font-semibold text-foreground mb-2">Stay Updated</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Get the latest updates on new features and enterprise solutions.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                                >
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-border pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
                                <p className="font-medium">
                                    © {new Date().getFullYear()} MinstrelMuse. All rights reserved.
                                </p>
                                <div className="flex items-center space-x-4">
                                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                                    <span>•</span>
                                    <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                                    <span>•</span>
                                    <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
                                This application is not affiliated with YouTube or Google. All YouTube content is subject to YouTube's Terms of Service.
                                MinstrelMuse provides enterprise-grade tools for music discovery and analytics while respecting all applicable copyright laws and platform policies.
                                Enterprise features include advanced security, compliance tools, and dedicated support for business customers.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;
