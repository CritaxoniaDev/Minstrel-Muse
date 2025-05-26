import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from "@/hooks/use-toast";

const OfflineGuard = ({ children }) => {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Don't redirect if already on offline page
    if (location.pathname === '/offline') return;

    if (!isOnline) {
      toast({
        title: "Connection Lost",
        description: "You've gone offline. Redirecting to offline mode...",
        duration: 3000,
      });
      
      setTimeout(() => {
        navigate('/offline');
      }, 1000);
    }
  }, [isOnline, navigate, location.pathname, toast]);

  return children;
};

export default OfflineGuard;
