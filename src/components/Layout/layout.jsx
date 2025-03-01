import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

const Layout = ({ user, children, currentTrack, onSearchResults, isMinimized, setIsMinimized, isOpen, setIsOpen }) => {
    return (
        <div className="relative min-h-screen">
            <Header 
                user={user} 
                onSearchResults={onSearchResults} 
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
            {user && (
                <Sidebar 
                    className="z-50" 
                    user={user} 
                    isMinimized={isMinimized} 
                    setIsMinimized={setIsMinimized}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                />
            )}
            <main className={cn(
                "relative min-h-screen transition-all duration-300",
                user ? (isMinimized ? 'lg:ml-20' : 'lg:ml-64') : 'mt-10',
                currentTrack ? 'lg:mr-80' : '',
                "px-4 md:px-6 lg:px-8"
            )}>
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
