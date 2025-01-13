import { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
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
        } catch (err) {
            setError(errorMessages[err.code] || 'An error occurred during Google sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mx-auto shadow-2xl w-full max-w-4xl h-[600px] grid md:grid-cols-2 overflow-hidden bg-white/5 backdrop-blur-lg">
            {/* Left Side - Visual Section */}
            <div className="relative hidden md:block h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-500 to-purple-700">
                    <div className="absolute inset-0 bg-black/30" />
                    <img
                        src="/resources/background.webp"
                        alt="Enterprise Background"
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
                    />
                </div>
                <div className="relative p-12 flex flex-col h-full justify-between text-white">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/minstrel-logo.png"
                            alt="MinstrelMuse Logo"
                            className="w-10 h-10 rounded-xl shadow-lg"
                        />
                        <span className="text-2xl font-bold tracking-tight">MinstrelMuse</span>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl font-bold leading-tight">Discover Your Perfect <br />Music Experience</h3>
                        <p className="text-base opacity-90 leading-relaxed">Join our community of music lovers and explore endless possibilities.</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="p-12 flex flex-col items-center justify-center min-h-full bg-white">
                <div className="w-full max-w-md mx-auto backdrop-blur-sm">
                    <CardHeader className="space-y-4 px-0 text-center mb-10">
                        <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-base text-gray-600/90 leading-relaxed">
                            Continue your musical journey with one click
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 px-0">
                        {error && (
                            <Alert variant="destructive" className="animate-shake shadow-lg border-red-200">
                                <AlertDescription className="font-medium">{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            variant="outline"
                            onClick={signInWithGoogle}
                            disabled={isLoading}
                            className="w-full h-16 relative overflow-hidden group border-2 hover:border-purple-400 transition-all duration-500 shadow-lg hover:shadow-xl rounded-xl"
                        >
                            <div className="absolute inset-0 w-3 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 transition-all duration-500 ease-out group-hover:w-full opacity-90"></div>
                            <div className="relative flex items-center justify-center gap-4">
                                <div className="bg-white p-2 rounded-lg shadow-sm">
                                    <img
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt="Google"
                                        className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <span className="text-lg font-semibold group-hover:text-white transition-colors duration-300">
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Connecting...</span>
                                        </div>
                                    ) : (
                                        'Continue with Google'
                                    )}
                                </span>
                            </div>
                        </Button>

                        <div className="flex items-center justify-center space-x-2 opacity-80">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <span className="text-sm text-gray-500">Secure login powered by Google</span>
                            <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>
                    </CardContent>
                </div>

                <div className="w-full pt-6 border-t border-gray-200/50 mt-auto">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                            <img
                                src="/images/logo.png"
                                alt="Adiklaas Logo"
                                className="w-6 h-6 rounded-md"
                            />
                        </div>
                        <span className="text-sm text-gray-600">
                            Maintained by <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Adiklaas</span>
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default Auth;
