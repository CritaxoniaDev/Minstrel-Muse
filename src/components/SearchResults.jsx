import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Pause, Plus } from "lucide-react";

const SearchResults = ({ results, currentTrack, isPlaying, onPlayPause, onAddToQueue }) => {
    return (
        <div className="container mx-auto px-4 py-6 pb-24">
            <Card>
                <CardHeader>
                    <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {results.map((video) => (
                            <div
                                key={video.id}
                                className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="rounded-md w-12 h-12 object-cover"
                                        />
                                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                                            {video.duration}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                                        <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onPlayPause(video)}
                                    >
                                        {currentTrack?.id === video.id && isPlaying ? (
                                            <Pause className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onAddToQueue(video)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SearchResults;
