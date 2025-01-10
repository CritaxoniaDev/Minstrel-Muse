const API_KEYS = [
    import.meta.env.VITE_YOUTUBE_API_KEY_1,
    import.meta.env.VITE_YOUTUBE_API_KEY_2,
    import.meta.env.VITE_YOUTUBE_API_KEY_3,
    import.meta.env.VITE_YOUTUBE_API_KEY_4,
    import.meta.env.VITE_YOUTUBE_API_KEY_5,
    import.meta.env.VITE_YOUTUBE_API_KEY_6,
    import.meta.env.VITE_YOUTUBE_API_KEY_7,
    import.meta.env.VITE_YOUTUBE_API_KEY_8,
    import.meta.env.VITE_YOUTUBE_API_KEY_9,
    import.meta.env.VITE_YOUTUBE_API_KEY_10
  ];
  
  let currentKeyIndex = 0;
  
  export const getYoutubeApiKey = () => API_KEYS[currentKeyIndex];
  
  export const rotateApiKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return getYoutubeApiKey();
  };
  