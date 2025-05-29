import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, RefreshCw, Music } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Offline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "You're back online! Redirecting...",
        duration: 2000,
      });
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, toast]);

  const handleRetry = () => {
    if (navigator.onLine) {
      navigate('/dashboard');
    } else {
      toast({
        title: "Still Offline",
        description: "Please check your internet connection",
        duration: 3000,
      });
    }
  };

  const handleOfflineMode = () => {
    navigate('/offline-mode');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          {isOnline ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
              <Wifi className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <WifiOff className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
          </h1>
          <p className="text-muted-foreground">
            {isOnline 
              ? 'Great! Your internet connection has been restored.'
              : 'It looks like you\'re not connected to the internet. You can still enjoy music in offline mode!'
            }
          </p>
        </div>

        {isOnline ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Redirecting to dashboard...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button onClick={handleOfflineMode} className="w-full">
                <Music className="h-4 w-4 mr-2" />
                Go to Offline Mode
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>In offline mode, you can:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Listen to cached music</li>
                <li>Browse your downloaded playlists</li>
                <li>Use the music player controls</li>
                <li>Access your library</li>
              </ul>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            MinstrelMuse - Music streaming platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offline;
