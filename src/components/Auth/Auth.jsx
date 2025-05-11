import { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from 'next-themes';

const Auth = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { theme } = useTheme();

    const errorMessages = {
        'auth/popup-closed-by-user': 'Google sign-in was cancelled',
        'auth/cancelled-popup-request': 'Google sign-in was cancelled',
        'auth/popup-blocked': 'Pop-up was blocked by your browser'
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const userDoc = await getDoc(doc(db, "users", result.user.uid));

            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", result.user.uid), {
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL,
                    username: result.user.email.split('@')[0],
                    role: "user",
                    isApproved: false,
                    createdAt: new Date().toISOString(),
                    favorites: [],
                    playlists: [],
                    settings: {
                        theme: theme || "light",
                        notifications: true,
                        language: "en"
                    },
                    stats: {
                        totalListens: 0,
                        lastActive: new Date().toISOString(),
                        joinDate: new Date().toISOString()
                    },
                    profile: {
                        bio: "",
                        location: "",
                        socialLinks: {}
                    }
                });
            }

            // Add the login activity notification
            await addDoc(collection(db, "userActivities"), {
                userId: result.user.uid,
                userName: result.user.displayName,
                userPhoto: result.user.photoURL,
                action: "Logged in",
                timestamp: serverTimestamp()
            });

        } catch (err) {
            setError(errorMessages[err.code] || 'An error occurred during Google sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-20 overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Logo and branding */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                            <img
                                src="/images/minstrel-logo.png"
                                alt="MinstrelMuse Logo"
                                className="w-8 h-8 rounded-md"
                            />
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-gray-800 dark:text-white">MinstrelMuse</span>
                    </div>
                    <div className="h-px w-16 bg-gray-200 dark:bg-gray-700 my-4"></div>
                </div>
                
                {/* Auth content */}
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Welcome</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Sign in to access your music dashboard
                        </p>
                    </div>

                    {error && (
                        <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/50 rounded-lg">
                            <AlertDescription className="text-sm font-medium">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={signInWithGoogle}
                        disabled={isLoading}
                        className={`
                            w-full py-6 relative rounded-lg shadow-sm
                            ${isLoading 
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' 
                                : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'}
                            transition-all duration-300
                        `}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                className="w-5 h-5"
                            />
                            <span className="font-medium">
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    'Sign in with Google'
                                )}
                            </span>
                        </div>
                    </Button>
                    
                    {/* Additional options could go here */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            By signing in, you agree to our <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
