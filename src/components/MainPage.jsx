import { auth } from '../config/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2, Youtube, Headphones, Radio, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const MainPage = () => {
    const user = auth.currentUser;

    return (
        <div className="min-h-screen flex items-center justify-center relative mt-[-6.6rem] overflow-hidden">
            {/* Animated Drawing Grid Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0
                    [background-size:50px_50px]
                    [mask-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
                    [mask-size:50px_50px]
                    animate-grid-fade-in">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
                    <div className="absolute inset-0
                        bg-[repeating-linear-gradient(to_right,#4f4f4f1a_0px,#4f4f4f1a_1px,transparent_1px,transparent_50px)]
                        animate-grid-slide-horizontal" />
                    <div className="absolute inset-0
                        bg-[repeating-linear-gradient(to_bottom,#4f4f4f1a_0px,#4f4f4f1a_1px,transparent_1px,transparent_50px)]
                        animate-grid-slide-vertical" />
                </div>
                {/* Keep the existing gradient orbs */}
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]" />
                <div className="absolute left-20 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
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

                <h1 className="text-7xl font-bold tracking-tighter bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    MinstrelMuse
                </h1>

                <p className="text-2xl text-muted-foreground tracking-tighter font-light">
                    Where Poetry Meets Melody in the Digital Age
                </p>

                <div className="flex items-center justify-center gap-4 pt-8">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="backdrop-blur-md bg-opacity-20">
                        Learn More
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default MainPage;
