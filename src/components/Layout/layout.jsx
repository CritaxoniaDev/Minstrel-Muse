import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Layout = ({ user, children, onSearchResults }) => {
    return (
        <div className="relative min-h-screen">
            <Header user={user} onSearchResults={onSearchResults} />
            {user && <Sidebar className="z-50" user={user} />}
            <main className={`${user ? 'lg:ml-64' : 'mt-10'} relative min-h-screen`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
