import { auth } from '../config/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2, Youtube, Headphones, Radio, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const MainPage = () => {
    const user = auth.currentUser;

    return (
        <div className="min-h-screen relative -mt-20">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-blue-900/30" />
                <div className="absolute inset-0 bg-[url('/resources/bg-pattern.png')] opacity-5 bg-repeat" />
                <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            </div>

            {/* Add this to create floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 blur-3xl opacity-30 animate-pulse" />
                <div className="absolute -inset-[10px] bg-gradient-to-b from-transparent via-purple-500/20 to-blue-500/20 blur-3xl opacity-30 animate-pulse delay-1000" />
            </div>  
            {/* Hero Section */}
            <div className="relative">
                <div className="container mx-auto py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center relative z-10"
                    >
                        <div className="flex justify-center items-center gap-4 mb-2">
                            <motion.div
                                className="relative"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 animate-pulse"></div>
                                <Music2 className="h-20 w-20 text-white bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full relative" />
                            </motion.div>
                        </div>

                        <h1 className="text-7xl font-bold tracking-tighter font-inter bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl [text-shadow:0_4px_8px_rgba(0,0,0,0.1)] flex items-center justify-center gap-4">
                            <span className='-mr-10'>MinstrelMuse</span>
                            <img
                                src="/resources/bg-image-2.png"
                                alt="MinstrelMuse Logo"
                                className="h-40 w-40 object-contain"
                            />
                        </h1>

                        <motion.p
                            className="text-3xl tracking-tighter text-muted-foreground max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Where Poetry Meets Melody in the Digital Age
                        </motion.p>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-32">
                <motion.div
                    className="flex flex-wrap justify-center gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.2 }}
                >
                    {[
                        {
                            icon: Youtube,
                            title: "Powered by YouTube",
                            description: "Access millions of songs through YouTube's vast library, bringing endless musical possibilities to your fingertips."
                        },
                        {
                            icon: Headphones,
                            title: "Modern Music Experience",
                            description: "Enjoy a seamless, ad-free listening experience with our intuitive player and beautiful interface."
                        },
                        {
                            icon: Radio,
                            title: "Curated Collections",
                            description: "Create and manage your personal playlists, discover new music, and share your favorites."
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="w-[380px]"
                        >
                            <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-primary/20 backdrop-blur-sm bg-white/5 h-[320px]">
                                <CardContent className="p-8 space-y-6">
                                    <div className="relative h-16 w-16">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
                                        <div className="relative h-full w-full rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <feature.icon className="h-8 w-8 text-primary" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl tracking-tighter font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground text-lg">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* About Section */}
            <div className="relative py-32 overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="max-w-4xl mx-auto text-center space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="h-16 w-16 text-primary mx-auto" />
                        </motion.div>
                        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            What is MinstrelMuse?
                        </h2>
                        <p className="text-2xl text-muted-foreground leading-relaxed">
                            MinstrelMuse combines the artistry of medieval minstrels with modern music streaming.
                            Just as minstrels were wandering musicians who brought songs and stories to life,
                            MinstrelMuse brings the world's music to your devices through YouTube's powerful API.
                        </p>
                        <Button
                            size="lg"
                            className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xl px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Start Your Musical Journey
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
