// MediaPlayerService.js
class MediaPlayerService {
    constructor() {
      this.audio = new Audio();
      this.currentTrack = null;
      this.isPlaying = false;
      this.setupMediaSession();
    }
  
    setupMediaSession() {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      }
    }
  
    updateMetadata(track) {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album,
          artwork: [
            { src: track.artwork, sizes: '512x512', type: 'image/png' }
          ]
        });
      }
    }
  
    loadTrack(track) {
      this.currentTrack = track;
      this.audio.src = track.url;
      this.updateMetadata(track);
      return this;
    }
  
    play() {
      if (this.currentTrack) {
        this.audio.play();
        this.isPlaying = true;
        
        // Broadcast to all components that playback has started
        window.dispatchEvent(new CustomEvent('music-playback-update', { 
          detail: { isPlaying: true, track: this.currentTrack } 
        }));
      }
      return this;
    }
  
    pause() {
      this.audio.pause();
      this.isPlaying = false;
      
      // Broadcast to all components that playback has paused
      window.dispatchEvent(new CustomEvent('music-playback-update', { 
        detail: { isPlaying: false, track: this.currentTrack } 
      }));
      
      return this;
    }
  
    next() {
      // Implement next track logic
      window.dispatchEvent(new CustomEvent('music-next-track'));
      return this;
    }
  
    previous() {
      // Implement previous track logic
      window.dispatchEvent(new CustomEvent('music-previous-track'));
      return this;
    }
  
    seek(time) {
      this.audio.currentTime = time;
      return this;
    }
  
    setVolume(level) {
      this.audio.volume = level;
      return this;
    }
  
    getCurrentTime() {
      return this.audio.currentTime;
    }
  
    getDuration() {
      return this.audio.duration;
    }
  }
  
  // Create a singleton instance
  const mediaPlayerService = new MediaPlayerService();
  export default mediaPlayerService;
  