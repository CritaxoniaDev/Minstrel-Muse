import { useState, useEffect } from 'react';

export const useOfflineStorage = () => {
  const [cachedTracks, setCachedTracks] = useState([]);
  const [cachedPlaylists, setCachedPlaylists] = useState([]);

  useEffect(() => {
    // Load cached data from localStorage
    const loadCachedData = () => {
      try {
        const tracks = localStorage.getItem('offlineTracks');
        const playlists = localStorage.getItem('offlinePlaylists');
        
        if (tracks) {
          setCachedTracks(JSON.parse(tracks));
        }
        
        if (playlists) {
          setCachedPlaylists(JSON.parse(playlists));
        }
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    };

    loadCachedData();
  }, []);

  const cacheTrack = (track) => {
    try {
      const updatedTracks = [...cachedTracks, track];
      setCachedTracks(updatedTracks);
      localStorage.setItem('offlineTracks', JSON.stringify(updatedTracks));
    } catch (error) {
      console.error('Error caching track:', error);
    }
  };

  const cachePlaylist = (playlist) => {
    try {
      const updatedPlaylists = [...cachedPlaylists, playlist];
      setCachedPlaylists(updatedPlaylists);
      localStorage.setItem('offlinePlaylists', JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Error caching playlist:', error);
    }
  };

  const clearCache = () => {
    setCachedTracks([]);
    setCachedPlaylists([]);
    localStorage.removeItem('offlineTracks');
    localStorage.removeItem('offlinePlaylists');
  };

  return {
    cachedTracks,
    cachedPlaylists,
    cacheTrack,
    cachePlaylist,
    clearCache
  };
};
