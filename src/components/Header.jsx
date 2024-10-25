import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Home, Compass, Library, LogOut } from 'lucide-react';

const Header = ({ user }) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1
                            onClick={() => navigate('/')}
                            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            YouPiFy
                        </h1>
                    </div>
    
                    {user && (
                        <nav className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-1">
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
                                    <Home className="h-4 w-4" />
                                    <span>Home</span>
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/dashboard/discover')}>
                                    <Compass className="h-4 w-4" />
                                    <span>Discover</span>
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/dashboard/library')}>
                                    <Library className="h-4 w-4" />
                                    <span>Library</span>
                                </Button>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50">
                                    <Avatar className="h-8 w-8 border-2 border-purple-200">
                                        <AvatarImage src={user.photoURL} />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white">
                                            {user.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:block text-sm font-medium">
                                        {user.displayName || user.email.split('@')[0]}
                                    </span>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:block">Sign Out</span>
                                </Button>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
    
};

export default Header;
