import { auth } from '../config/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2, Youtube, Headphones, Radio, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const MainPage = () => {
    const user = auth.currentUser;

    return (
        <div className="min-h-screen flex items-center justify-center relative -mt-40 ">
            {/* Gradient Background */}
           
            
            {/* Content */}
            <motion.div 
                className="text-center z-10 space-y-6"
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
                    <Button size="lg" variant="outline">
                        Learn More
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default MainPage;
