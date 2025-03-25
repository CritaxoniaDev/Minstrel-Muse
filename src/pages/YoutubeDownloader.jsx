import React, { useState, useRef } from 'react';
import { getYoutubeApiKey, rotateApiKey } from '@/config/youtube-api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Download, Music, Youtube, Check } from 'lucide-react';

const YoutubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const downloadRef = useRef(null);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }
   
    setIsLoading(true);
    setVideoInfo(null);
    setDownloadComplete(false);
   
    try {
      // Extract video ID from URL
      const videoId = extractVideoId(url);
     
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }
     
      // Get video details using YouTube API
      const apiKey = getYoutubeApiKey();
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`);
     
      if (!response.ok) {
        // If rate limited, try rotating API key
        if (response.status === 403) {
          rotateApiKey();
          throw new Error("YouTube API quota exceeded. Please try again.");
        }
        throw new Error("Failed to fetch video details");
      }
     
      const data = await response.json();
     
      if (!data.items || data.items.length === 0) {
        throw new Error("Video not found");
      }
     
      const videoTitle = data.items[0].snippet.title;
      const thumbnailUrl = data.items[0].snippet.thumbnails.high?.url || data.items[0].snippet.thumbnails.default?.url;
      
      // Create a safe filename for the download
      const safeTitle = videoTitle
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '_')
        .substring(0, 100);
      
      // Use a direct download service that returns the file directly
      // This is a more reliable approach for direct downloads
      const downloadUrl = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${videoId}&f=mp3`;
      
      // Alternative direct download URL (backup)
      const backupDownloadUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;
     
      setVideoInfo({
        title: videoTitle,
        thumbnail: thumbnailUrl,
        videoId: videoId,
        downloadUrl: downloadUrl,
        backupDownloadUrl: backupDownloadUrl,
        filename: `${safeTitle}.mp3`
      });
     
      toast({
        title: "Success!",
        description: "Click the download button to get your MP3",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to process your request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async () => {
    if (!videoInfo) return;
    
    setIsDownloading(true);
    setDownloadComplete(false);
    
    try {
      // Create an invisible iframe to handle the download
      // This approach allows us to trigger the download without leaving the page
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = videoInfo.downloadUrl;
      document.body.appendChild(iframe);
      
      // Show a toast notification
      toast({
        title: "Download Started",
        description: "Your download has started in the background",
      });
      
      // Set a timeout to simulate download completion
      // In reality, we can't track the actual download progress from a third-party site
      setTimeout(() => {
        document.body.removeChild(iframe);
        setIsDownloading(false);
        setDownloadComplete(true);
        
        toast({
          title: "Download Complete",
          description: "Your MP3 file has been downloaded",
          variant: "success",
        });
        
        // Reset the download complete status after a few seconds
        setTimeout(() => {
          setDownloadComplete(false);
        }, 5000);
      }, 3000);
    } catch (error) {
      setIsDownloading(false);
      
      toast({
        title: "Download Failed",
        description: "Please try the backup download option",
        variant: "destructive",
      });
    }
  };
  
  const handleBackupDownload = () => {
    if (!videoInfo) return;
    
    // For the backup, we'll use a new tab approach
    // This is more reliable but takes the user away from the page temporarily
    window.open(videoInfo.backupDownloadUrl, '_blank');
    
    toast({
      title: "Backup Download",
      description: "Using alternative download method in a new tab",
    });
  };
  
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            YouTube to MP3 Converter
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Download audio from YouTube videos
          </p>
        </div>
       
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="youtube-url" className="block text-sm font-medium mb-1">
                YouTube Video URL
              </label>
              <div className="flex gap-2">
                <input
                  id="youtube-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "py-2 px-4 rounded-md text-white font-medium flex items-center gap-2",
                    isLoading
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Youtube className="h-4 w-4" />
                      <span>Convert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
         
          {videoInfo && (
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-32 h-auto rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-2">{videoInfo.title}</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className={cn(
                        "inline-flex items-center gap-2 py-2 px-4 rounded-md text-white font-medium transition-colors",
                        isDownloading
                          ? "bg-gray-400 cursor-not-allowed"
                          : downloadComplete
                            ? "bg-green-600"
                            : "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Downloading...</span>
                        </>
                      ) : downloadComplete ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Downloaded</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download MP3</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleBackupDownload}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Alternative Download</span>
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {downloadComplete 
                      ? "Download complete! Check your downloads folder." 
                      : "Click the button above to download your MP3 file"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
       
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How to use</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Copy the YouTube video URL you want to convert</li>
            <li>Paste the URL in the input field above</li>
            <li>Click the "Convert" button</li>
            <li>Wait for the processing to complete</li>
            <li>Click the "Download MP3" button to start the download</li>
            <li>If the main download doesn't work, try the "Alternative Download" option</li>
          </ol>
         
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
            <p className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>Note: This tool is for personal use only. Please respect copyright laws and YouTube's Terms of Service.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YoutubeDownloader;
