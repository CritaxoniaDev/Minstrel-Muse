import sharp from 'sharp';
import fs from 'fs/promises';

async function generateIcons() {
  try {
    // Create a 512x512 purple background
    const svgBuffer = Buffer.from(`
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#5b21b6"/>
        <text x="50%" y="50%" font-family="Arial" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle">MM</text>
      </svg>
    `);
    
    // Generate 512x512 icon
    await sharp(svgBuffer)
      .png()
      .toFile('public/pwa-512x512.png');
      
    // Generate 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('public/pwa-192x192.png');
      
    console.log('PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
