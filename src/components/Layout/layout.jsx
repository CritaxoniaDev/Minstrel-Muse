import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

const Layout = ({ user, children, onSearchResults, isMinimized, setIsMinimized, isOpen, setIsOpen }) => {
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
            <main className={`${user ? (isMinimized ? 'lg:ml-20' : 'lg:ml-64') : 'mt-10'} relative min-h-screen transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
};



export default Layout;
