import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Header = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <header className="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-3xl font-bold text-white tracking-tighter">YouPiFy</h1>
                        <span className="ml-2 text-purple-200 text-sm">Music for Everyone</span>
                    </div>
                    <nav>
                        {user && (
                            <ul className="flex space-x-6">
                                <li><a href="#" className="text-white hover:text-purple-200 transition-colors">Home</a></li>
                                <li><a href="#" className="text-white hover:text-purple-200 transition-colors">Discover</a></li>
                                <li><a href="#" className="text-white hover:text-purple-200 transition-colors">Library</a></li>
                                <li><a href="#" className="text-white hover:text-purple-200 transition-colors">Profile</a></li>
                            </ul>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
