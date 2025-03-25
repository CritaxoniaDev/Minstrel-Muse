const ytdl = require('ytdl-core');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId, title } = req.body;
    
    if (!videoId || !title) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Get video info
    const info = await ytdl.getInfo(videoUrl);
    
    // Get the audio format with the highest quality
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio', 
      filter: 'audioonly' 
    });
    
    if (!audioFormat) {
      return res.status(404).json({ error: 'No suitable audio format found' });
    }
    
    // Create a safe filename
    const safeTitle = title
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 100);
    
    const uniqueId = uuidv4().substring(0, 8);
    const filename = `${safeTitle}_${uniqueId}.mp3`;
    
    // Return the direct URL to the audio stream
    return res.status(200).json({
      success: true,
      downloadUrl: audioFormat.url,
      contentType: audioFormat.mimeType,
      filename: filename,
      videoTitle: info.videoDetails.title
    });
    
  } catch (error) {
    console.error('Error processing YouTube audio:', error);
    return res.status(500).json({ 
      error: 'Failed to process download',
      message: error.message 
    });
  }
};
