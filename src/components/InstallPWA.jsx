import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [debugMessage, setDebugMessage] = useState("Waiting for install prompt...");

  useEffect(() => {
    console.log("InstallPWA component mounted");
    
    const handler = (e) => {
      e.preventDefault();
      console.log('Installation prompt captured');
      setSupportsPWA(true);
      setPromptInstall(e);
      setDebugMessage("Install prompt ready!");
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDebugMessage("App is already installed");
      console.log("App is already installed");
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      console.log('No installation prompt available');
      setDebugMessage("No installation prompt available");
      return;
    }
    promptInstall.prompt();
    
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDebugMessage("Installation accepted!");
      } else {
        console.log('User dismissed the install prompt');
        setDebugMessage("Installation dismissed");
      }
      setPromptInstall(null);
    });
  };

  // Always show the button in development for testing
  const isDev = process.env.NODE_ENV === 'development';

  // Return a visible button for debugging in development
  if (isDev) {
    return (
      <div>
        <Button
          variant="outline"
          onClick={onClick}
          className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
          disabled={!supportsPWA && !isDev}
        >
          <Download className="h-5 w-5 text-purple-600 mr-2" />
          Install
        </Button>
        <span className="sr-only">{debugMessage}</span>
      </div>
    );
  }

  // In production, only show when installable
  if (!supportsPWA) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
      title="Install App"
    >
      <Download className="h-5 w-5 text-purple-600" />
    </Button>
  );
}

export default InstallPWA;
