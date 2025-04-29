import { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Music, Lock, ChevronRight } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

const Auth = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
                        theme: "light",
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
        <div className="pt-20 flex items-center justify-center p-4 bg-white">
            <Card className={`
                mx-auto w-full 
                ${isMobile ? 'max-w-[95%]' : isTablet ? 'max-w-3xl' : 'max-w-4xl'}
                grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} 
                rounded-lg overflow-hidden
                shadow-[0_10px_40px_rgba(0,0,0,0.05)]
                border border-gray-100
                bg-white
            `}>
                {/* Left Side - Visual Section */}
                <div className="relative hidden md:block h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {[...Array(8)].map((_, i) => (
                                    <circle
                                        key={i}
                                        cx={Math.random() * 100}
                                        cy={Math.random() * 100}
                                        r={Math.random() * 8 + 2}
                                        fill="rgba(255,255,255,0.2)"
                                    />
                                ))}
                            </svg>
                        </div>
                    </div>
                    <div className="relative p-10 flex flex-col h-full justify-between text-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
                                <img
                                    src="/images/minstrel-logo.png"
                                    alt="MinstrelMuse Logo"
                                    className="w-8 h-8 rounded-md"
                                />
                            </div>
                            <span className="text-xl font-semibold tracking-tight">MinstrelMuse</span>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-semibold leading-tight">
                                    Enterprise Music <br />
                                    <span className="font-bold">
                                        Management Platform
                                    </span>
                                </h3>
                                <p className="text-sm opacity-90 leading-relaxed max-w-md">
                                    Streamlined access to your organization's music resources, analytics, and collaboration tools.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                {['Secure Enterprise Access', 'Centralized Management', 'Advanced Analytics'].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                            <ChevronRight className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 text-xs text-white/70">
                            © {new Date().getFullYear()} MinstrelMuse. All rights reserved.
                        </div>
                    </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="flex flex-col items-center justify-center min-h-full bg-white p-8 md:p-10">
                    <div className="w-full max-w-md mx-auto">
                        <CardHeader className="space-y-3 px-0 text-center mb-8">
                            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                                <Lock className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-semibold text-gray-900">
                                Welcome to MinstrelMuse
                            </CardTitle>
                            <CardDescription className="text-gray-500 text-sm">
                                Sign in to access your enterprise dashboard
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 px-0">
                            {error && (
                                <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-100 rounded-lg">
                                    <AlertDescription className="text-sm font-medium">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                variant="outline"
                                onClick={signInWithGoogle}
                                disabled={isLoading}
                                className="w-full h-12 relative border border-gray-200 hover:border-blue-400 
                                           hover:bg-blue-50 transition-all duration-300 rounded-lg shadow-sm"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <img
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    <span className="text-gray-700 font-medium">
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

                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-px w-16 bg-gray-100"></div>
                                <span className="text-xs text-gray-400">
                                    Enterprise SSO
                                </span>
                                <div className="h-px w-16 bg-gray-100"></div>
                            </div>
                        </CardContent>
                    </div>

                    <div className="w-full pt-8 mt-auto">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="p-1.5 bg-gray-50 rounded-md">
                                <img
                                    src="/images/logo.png"
                                    alt="Adiklaas Logo"
                                    className="w-4 h-4 rounded-sm"
                                />
                            </div>
                            <span className="text-xs text-gray-400">
                                Maintained by <span className="font-medium text-gray-500">Adiklaas</span>
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Auth;
