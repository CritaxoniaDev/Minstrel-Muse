import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Check, AlertTriangle, Info } from "lucide-react";

const TermsOfService = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center border-b">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        MinstrelMuse Terms of Service
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="p-6">
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="space-y-8">
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        By accessing or using MinstrelMuse, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
                                    </p>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                        <div className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">
                                                These Terms constitute a legally binding agreement between you and MinstrelMuse regarding your use of the service.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">2. Description of Service</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        MinstrelMuse provides a platform for music discovery, streaming, and playlist creation. We offer personalized recommendations and social features to enhance your music experience.
                                    </p>
                                    <p>
                                        Our service may change from time to time without prior notice. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">3. User Accounts</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        To access certain features of MinstrelMuse, you must create an account. You are responsible for:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Maintaining the confidentiality of your account credentials</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Restricting access to your account and password</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>All activities that occur under your account</span>
                                        </li>
                                    </ul>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30 mt-2">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">
                                                You must notify us immediately of any unauthorized use of your account or any other security breach.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">4. Content and Conduct</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        You agree not to use MinstrelMuse to:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span>Violate any applicable laws or regulations</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span>Infringe upon the rights of others</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span>Distribute harmful, offensive, or inappropriate content</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span>Attempt to gain unauthorized access to any part of the service</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 font-bold">•</span>
                                            <span>Interfere with the proper functioning of the service</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        MinstrelMuse and its content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
                                    </p>
                                    <p>
                                        You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our service without our prior written consent.
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">6. Third-Party Services</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        MinstrelMuse may integrate with third-party services, including but not limited to:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <span>Google Firebase for authentication and data storage</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <span>YouTube API for content delivery</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <span>Analytics services for performance monitoring</span>
                                        </li>
                                    </ul>
                                    <p>
                                        Your use of these third-party services is subject to their respective terms of service and privacy policies.
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        In no event shall MinstrelMuse, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                                    </p>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">
                                                We do not guarantee that the service will be uninterrupted, timely, secure, or error-free.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">8. Termination</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms of Service.
                                    </p>
                                    <p>
                                        Upon termination, your right to use the service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">9. Changes to Terms</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                                    </p>
                                    <p>
                                        By continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms.
                                    </p>
                                </div>
                            </section>

                            <Separator />

                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-2xl font-semibold">10. Contact Us</h2>
                                </div>
                                <div className="space-y-3 text-muted-foreground">
                                    <p>
                                        If you have any questions about these Terms, please contact us at:
                                    </p>
                                    <p className="font-medium text-purple-600 dark:text-purple-400">
                                        terms@minstrelmuse.com
                                    </p>
                                </div>
                            </section>

                            <div className="text-center pt-6 text-sm text-muted-foreground">
                                © {new Date().getFullYear()} MinstrelMuse. All rights reserved.
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default TermsOfService;
