import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, ArrowRight } from "lucide-react";

const DataDeletion = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center border-b">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Data Deletion Instructions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                <Trash2 className="text-purple-600" />
                                How to Delete Your Data
                            </h2>
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    YouPiFy values your privacy and makes it easy to delete your personal data. You have two options:
                                </p>
                                
                                <div className="space-y-6 mt-6">
                                    <div className="bg-purple-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3">Option 1: In-App Deletion</h3>
                                        <ol className="list-decimal ml-4 space-y-2">
                                            <li>Log in to your YouPiFy account</li>
                                            <li>Go to Settings | Privacy</li>
                                            <li>Click on "Delete Account & Data"</li>
                                            <li>Confirm your decision</li>
                                        </ol>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-3">Option 2: Email Request</h3>
                                        <p className="mb-4">Send a deletion request to our support team:</p>
                                        <Button 
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-2"
                                            onClick={() => window.location.href = 'mailto:privacy@youpify.com?subject=Data%20Deletion%20Request'}
                                        >
                                            <Mail className="h-4 w-4" />
                                            Send Deletion Request
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="border-t pt-6">
                            <h2 className="text-xl font-semibold mb-4">What Gets Deleted</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Account information</li>
                                <li>Profile data</li>
                                <li>Playlists and favorites</li>
                                <li>Usage history</li>
                                <li>All associated personal information</li>
                            </ul>
                        </section>

                        <div className="text-sm text-gray-500 mt-8">
                            Note: Deletion process typically completes within 30 days. You'll receive a confirmation email once completed.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DataDeletion;
