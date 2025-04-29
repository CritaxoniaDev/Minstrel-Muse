import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center border-b">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        MinstrelMuse Privacy Policy
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="space-y-6">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                                <div className="space-y-3">
                                    <p>When you use MinstrelMuse, we collect:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Account information (email, name, profile picture)</li>
                                        <li>Music preferences and listening history</li>
                                        <li>Playlists and favorites</li>
                                        <li>Device information and usage statistics</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                                <div className="space-y-3">
                                    <p>We use your information to:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Personalize your music experience</li>
                                        <li>Improve our recommendations</li>
                                        <li>Provide customer support</li>
                                        <li>Send relevant updates and notifications</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
                                <p>
                                    We implement industry-standard security measures to protect your data. 
                                    Your information is stored securely using Firebase's infrastructure and 
                                    encrypted during transmission.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
                                <p>
                                    We use trusted third-party services including:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 mt-2">
                                    <li>Google Firebase for authentication and data storage</li>
                                    <li>Facebook for social authentication</li>
                                    <li>Analytics tools to improve our service</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                                <p>You have the right to:</p>
                                <ul className="list-disc pl-6 space-y-2 mt-2">
                                    <li>Access your personal data</li>
                                    <li>Request data deletion</li>
                                    <li>Opt-out of marketing communications</li>
                                    <li>Update your preferences</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
                                <p>
                                    For any privacy-related questions or concerns, contact us at:
                                    <br />
                                    <span className="text-purple-600">privacy@youpify.com</span>
                                </p>
                            </section>

                            <div className="text-center pt-6 text-sm text-muted-foreground">
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default PrivacyPolicy;
