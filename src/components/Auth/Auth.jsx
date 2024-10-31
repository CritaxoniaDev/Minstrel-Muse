import { useState } from 'react';
import { auth, db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, AtSign, Mail, Lock, Image, UserPlus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const Auth = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        username: '',
        photo: null
    });

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file
            }));
        }
    };

    const signUp = async () => {
        if (!formData.name || !formData.username) {
            setError('Please fill in all fields');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            let photoURL = null;
            if (formData.photo) {
                const storageRef = ref(storage, `users/${userCredential.user.uid}/profile`);
                const uploadResult = await uploadBytes(storageRef, formData.photo);
                photoURL = await getDownloadURL(uploadResult.ref);
            }

            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    createdAt: new Date().toISOString(),
                    photoURL: photoURL,
                    role: "member",
                    isApproved: false,
                    favorites: [],
                    playlists: []
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: formData.email,
                    createdAt: new Date().toISOString(),
                    role: "member",
                    isApproved: false,
                    favorites: [],
                    playlists: []
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);

            // First check if user document exists
            const userDoc = await getDoc(doc(db, "users", result.user.uid));

            if (!userDoc.exists()) {
                // Only create new document if user doesn't exist
                await setDoc(doc(db, "users", result.user.uid), {
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL,
                    role: "member",
                    isApproved: false,
                    createdAt: new Date().toISOString(),
                    favorites: [],
                    playlists: []
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={`mx-auto shadow-xl ${isMobile ? 'w-[95%] max-w-md' :
            isTablet ? 'w-[90%] max-w-2xl' :
                'w-full max-w-4xl grid md:grid-cols-2'
            } overflow-hidden`}>
            {/* Left Side - Visual Section */}
            {(isTablet || isDesktop) && (
                <div className="relative hidden md:block">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600">
                        <div className="absolute inset-0 bg-black/20" />
                        <img
                            src="/resources/background.webp"
                            alt="Enterprise Background"
                            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                        />
                    </div>
                    <div className="relative p-8 flex flex-col h-full justify-between text-white">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">MinstrelMuse</span>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold">Transform Your Music Experience</h3>
                            <p className="text-sm opacity-90">Join thousands of users who trust MinstrelMuse for their music needs.</p>
                            <div className="flex gap-3">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold">10K+</span>
                                    <span className="text-xs">Active Users</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold">50M+</span>
                                    <span className="text-xs">Songs Played</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Right Side - Auth Forms */}
            <div className={`${isMobile ? 'p-4' : 'p-8'}`}>
                <Tabs defaultValue="login" className="space-y-6">
                <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'text-sm' : ''}`}>
                        <TabsTrigger
                            value="login"
                            className="transition-all duration-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                        >
                            Login
                        </TabsTrigger>
                        <TabsTrigger
                            value="register"
                            className="transition-all duration-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                        >
                            Register
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative min-h-[470px]">
                        <TabsContent
                            value="login"
                            className="space-y-4 absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out"
                        >
                            <CardHeader className="space-y-1 px-0">
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Welcome Back!
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Sign in to continue your music journey
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 px-0">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={signInWithGoogle}
                                    disabled={isLoading}
                                    className="w-full relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 w-3 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
                                    <div className="relative flex items-center justify-center gap-2">
                                        <img
                                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                            alt="Google"
                                            className="w-5 h-5"
                                        />
                                        <span className="group-hover:text-white transition-colors duration-200">
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Please wait...</span>
                                                </div>
                                            ) : (
                                                'Continue with Google'
                                            )}
                                        </span>
                                    </div>
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            Or continue with email
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="Email address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-600 border-gray-200 hover:border-purple-400"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-600 border-gray-200 hover:border-purple-400"
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4 px-0">
                                <Button
                                    className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={signIn}
                                    disabled={isLoading}
                                >
                                    <span className="relative flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Signing in...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                            </>
                                        )}
                                    </span>
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Forgot your password?{' '}
                                    <Link to="/reset-password" className="text-purple-600 hover:underline">
                                        Reset it here
                                    </Link>
                                </p>
                            </CardFooter>
                        </TabsContent>
                        <TabsContent
                            value="register"
                            className="space-y-4 absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out"
                        >
                            <CardHeader className="space-y-1 px-0">
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Create an Account
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Join our community and start your musical journey today
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 px-0">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            name="name"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-600 border-gray-200 hover:border-purple-400"
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type="text"
                                            name="username"
                                            placeholder="Choose a username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-600 border-gray-200 hover:border-purple-400"
                                        />
                                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="Email address"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-600 border-gray-200 hover:border-purple-400"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type="password"
                                            name="password"
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-600 border-gray-200 hover:border-purple-400"
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={isLoading}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-400 cursor-pointer transition-colors"
                                            >
                                                <Image className="h-5 w-5 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {formData.photo ? formData.photo.name : 'Upload a profile picture'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    onClick={signUp}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </CardContent>
                        </TabsContent>
                    </div>
                </Tabs>
                <div className="pt-2 mt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                        <img
                            src="/images/logo.png"
                            alt="Adiklaas Logo"
                            className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-muted-foreground">
                            Maintained by <span className="font-medium text-purple-600">Adiklaas</span>
                        </span>
                    </div>
                </div>
            </div>
        </Card>

    );
};

export default Auth;
