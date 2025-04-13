import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ user, children, onSearchResults, isMinimized, setIsMinimized, sidebarOpen, setSidebarOpen, setIsLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

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
            <main className={`${user ? (isMinimized ? 'lg:ml-20' : 'lg:ml-64') : 'mt-10'} relative min-h-screen transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
