import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Music2, Smile, Search, X, Upload, Loader2 } from "lucide-react";
import axios from 'axios';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from "@/hooks/use-toast";

const CreatePost = ({ currentUser }) => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [content, setContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handlePost = async () => {
        if (!content.trim() && !selectedMusic && !imagePreview) {
            toast({
                title: "Empty Post",
                description: "Add some content, music, or image to share",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            const postData = {
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userPhoto: currentUser.photoURL,
                content: content,
                image: imagePreview,
                music: selectedMusic ? {
                    id: selectedMusic.id,
                    title: selectedMusic.title,
                    thumbnail: selectedMusic.thumbnail,
                    channelTitle: selectedMusic.channelTitle
                } : null,
                likes: 0,
                comments: 0,
                shares: 0,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "posts"), postData);

            toast({
                title: "Post Created",
                description: "Your post has been shared successfully",
            });

            navigate('/dashboard');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create post. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMusicSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    maxResults: 5,
                    key: getYoutubeApiKey(),
                    type: 'video',
                    q: searchQuery
                }
            });

            const results = response.data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.default.url,
                channelTitle: item.snippet.channelTitle,
            }));

            setSearchResults(results);
        } catch (error) {
            if (error?.response?.status === 403 || error?.response?.status === 429) {
                rotateApiKey();
            }
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8">
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Create Post</CardTitle>
                    <p className="text-sm text-muted-foreground">Share your musical journey with the world</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* User Info */}
                    <div className="flex space-x-4 items-center">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarImage src={currentUser?.photoURL} />
                            <AvatarFallback>{currentUser?.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{currentUser?.displayName}</p>
                            <p className="text-sm text-muted-foreground">Public post</p>
                        </div>
                    </div>

                    {/* Content Input */}
                    <Textarea
                        placeholder="What's on your mind?"
                        className="min-h-[120px] resize-none focus:ring-primary"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                        />

                        {imagePreview ? (
                            <div className="relative rounded-lg overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 rounded-full opacity-90 hover:opacity-100"
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Click to upload an image</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                            </div>
                        )}
                    </div>

                    {/* Music Selection Section */}
                    {!selectedMusic ? (
                        <div className="space-y-4 border rounded-lg p-4 bg-card">
                            <h3 className="font-medium flex items-center gap-2">
                                <Music2 className="h-4 w-4 text-primary" />
                                Add Music
                            </h3>
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Search for a song..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="focus:ring-primary"
                                />
                                <Button
                                    onClick={handleMusicSearch}
                                    disabled={isSearching}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    {isSearching ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
                                    {searchResults.map((result) => (
                                        <div
                                            key={result.id}
                                            className="flex items-center space-x-3 p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors"
                                            onClick={() => setSelectedMusic(result)}
                                        >
                                            <img
                                                src={result.thumbnail}
                                                alt={result.title}
                                                className="h-12 w-12 rounded-md object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{result.title}</p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {result.channelTitle}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3 bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <img
                                src={selectedMusic.thumbnail}
                                alt={selectedMusic.title}
                                className="h-16 w-16 rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{selectedMusic.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                    {selectedMusic.channelTitle}
                                </p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedMusic(null)}
                                className="hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/dashboard')}
                            className="hover:bg-destructive/5 hover:text-destructive"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            disabled={isUploading}
                            onClick={handlePost}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Posting...
                                </>
                            ) : (
                                'Share Post'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreatePost;