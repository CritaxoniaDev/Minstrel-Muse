import { useState } from 'react';
import { auth, db } from '../../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        username: ''
    });

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
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

            // Store additional user data in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                createdAt: new Date().toISOString(),
                photoURL: userCredential.user.photoURL || null,
                isApproved: false, // Add this line
                favorites: [],
                playlists: []
            });
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
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
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
            // Store Google user data in Firestore
            await setDoc(doc(db, "users", result.user.uid), {
                name: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                isApproved: false, // Add this line
                createdAt: new Date().toISOString(),
                favorites: [],
                playlists: []
            }, { merge: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto grid md:grid-cols-2 overflow-hidden shadow-xl">
            {/* Left Side - Visual Section */}
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
                        <span className="text-xl font-bold">YouPiFy</span>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold">Transform Your Music Experience</h3>
                        <p className="text-sm opacity-90">Join thousands of users who trust YouPiFy for their music needs.</p>
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

            {/* Right Side - Auth Forms */}
            <div className="p-8">
                <Tabs defaultValue="login" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
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

                    <div className="relative min-h-[450px]">
                        <TabsContent
                            value="login"
                            className="space-y-4 absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out"
                        >
                            <CardHeader className="space-y-1 px-0">
                                <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
                                <CardDescription>Sign in to continue your music journey</CardDescription>
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
                                            {isLoading ? 'Please wait...' : 'Continue with Google'}
                                        </span>
                                    </div>
                                </Button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            Or continue with email
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-600"
                                    />
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-600"
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4 px-0">
                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    onClick={signIn}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </CardFooter>
                        </TabsContent>

                        <TabsContent
                            value="register"
                            className="space-y-4 absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out"
                        >
                            <CardHeader className="space-y-1 px-0">
                                <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                                <CardDescription>Enter your details to get started</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 px-0">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-4">
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-600"
                                    />
                                    <Input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-600"
                                    />
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-600"
                                    />
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-purple-600"
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4 px-0">
                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    onClick={signUp}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </CardFooter>
                        </TabsContent>
                    </div>
                </Tabs>
                <div className="pt-6 mt-6 border-t border-gray-200">
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
