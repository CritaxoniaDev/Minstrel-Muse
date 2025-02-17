import { Heart, Github, Twitter, Instagram, Youtube, Music2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

const Footer = () => {
    return (
        <footer className="w-full bg-gradient-to-t from-background/95 to-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-primary/10">
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Logo Section */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-2 text-2xl font-bold">
                        <Music2 className="h-8 w-8 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            YouPiFy
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Company</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">About</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">Careers</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">Press</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Communities</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">For Artists</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">Developers</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">Advertising</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Useful Links</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">Support</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">Mobile App</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-block">Help Center</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Connect</h4>
                        <div className="flex flex-wrap gap-4">
                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:scale-110 transition-transform">
                                <Github className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:scale-110 transition-transform">
                                <Twitter className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:scale-110 transition-transform">
                                <Instagram className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:scale-110 transition-transform">
                                <Youtube className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-primary/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>© {new Date().getFullYear()} YouPiFy.</span>
                            <span>All rights reserved.</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:underline">Privacy Policy</a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:underline">Terms of Service</a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:underline">Cookies</a>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground group cursor-pointer">
                            <span>Made with</span>
                            <Heart className="h-4 w-4 text-red-500 fill-red-500 group-hover:animate-ping" />
                            <span className="group-hover:text-primary transition-colors">by Adiklaas Team</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
