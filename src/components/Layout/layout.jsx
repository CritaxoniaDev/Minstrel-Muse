import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Layout = ({ user, children, onSearchResults }) => {
    return (
        <div>
            <Header user={user} onSearchResults={onSearchResults} />
            {user && <Sidebar user={user} />}
            <main className={`${user ? 'lg:ml-64' : 'mt-20'} `}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
