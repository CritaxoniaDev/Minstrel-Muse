import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ user, children, onSearchResults, isMinimized, setIsMinimized, sidebarOpen, setSidebarOpen, setIsLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showMiniPlayer, setShowMiniPlayer] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const navigate = useNavigate();

    // Listen for music playback events
    useEffect(() => {
        const handlePlaybackUpdate = (event) => {
            setShowMiniPlayer(true);
            setCurrentTrack(event.detail.track);
        };

        window.addEventListener('music-playback-update', handlePlaybackUpdate);
        
        return () => {
            window.removeEventListener('music-playback-update', handlePlaybackUpdate);
        };
    }, []);

    // Custom navigation function with loading animation
    const navigateWithLoading = (path) => {
        setIsLoading(true);
        setTimeout(() => {
            navigate(path);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="relative min-h-screen">
            <Header 
                user={user} 
                onSearchResults={onSearchResults} 
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                navigateWithLoading={navigateWithLoading}
            />
            {user && (
                <Sidebar 
                    className="z-50" 
                    user={user} 
                    isMinimized={isMinimized} 
                    setIsMinimized={setIsMinimized}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    navigateWithLoading={navigateWithLoading}
                />
            )}
            <main className={`${user ? (isMinimized ? 'lg:ml-20' : 'lg:ml-64') : 'mt-10'} relative min-h-screen transition-all duration-300 ${showMiniPlayer ? 'pb-16' : ''}`}>
                {children}
            </main>
            
            {/* Mini Player that stays visible even when app is minimized */}
            {showMiniPlayer && <MiniPlayer track={currentTrack} />}
        </div>
    );
};

export default Layout;
