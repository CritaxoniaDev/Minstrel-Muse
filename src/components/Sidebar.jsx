import { Home, Compass, Library, User, Settings, Music2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Sidebar = ({ user }) => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: Compass, label: 'Discover', path: '/dashboard/discover' },
        { icon: Library, label: 'Library', path: '/dashboard/library' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
    ];

    return (
        <div className="hidden lg:flex h-screen fixed left-0 flex-col w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
            {/* Profile Section */}
            <div className="flex flex-col items-center space-y-4 mb-8">
                <div className="relative group">
                    <img
                        src={user?.photoURL}
                        alt={user?.displayName}
                        className="h-24 w-24 rounded-full border-4 border-purple-500/20 transition-transform duration-300 group-hover:scale-105"
                        onClick={() => navigate('/dashboard/profile')}
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Music2 className="h-3 w-3" />
                        Online
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <h4 className="text-2xl font-bold">0</h4>
                    <p className="text-xs text-muted-foreground">Playlists</p>
                </div>
                <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <h4 className="text-2xl font-bold">0</h4>
                    <p className="text-xs text-muted-foreground">Favorites</p>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Navigation */}
            <nav className="space-y-2 mt-auto">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Button
                            key={index}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-2 hover:bg-accent transition-all duration-200",
                                window.location.pathname === item.path &&
                                "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-500"
                            )}
                            onClick={() => navigate(item.path)}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Button>
                    );
                })}
            </nav>

            {/* Recently Played Section */}
            <div className="mt-8">
                <h4 className="text-sm font-semibold mb-4">Recently Played</h4>
                <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                                <Music2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">No track played</p>
                                <p className="text-xs text-muted-foreground">Play something!</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
