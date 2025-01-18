import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Layout = ({ user, children, onSearchResults, setIsMinimized, isMinimized }) => {
    return (
        <div className="relative min-h-screen">
            <Header user={user} onSearchResults={onSearchResults} />
            {user && (
                <Sidebar 
                    className="z-50" 
                    user={user} 
                    isMinimized={isMinimized} 
                    setIsMinimized={setIsMinimized}
                />
            )}
            <main className={`${user ? (isMinimized ? 'lg:ml-20' : 'lg:ml-64') : 'mt-10'} relative min-h-screen transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
};


export default Layout;
