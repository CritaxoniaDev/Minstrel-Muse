import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function generatePlayIcon() {
  try {
    // Create directory if it doesn't exist
    const iconsDir = path.join(process.cwd(), 'public', 'icons');
    try {
      await fs.access(iconsDir);
    } catch (error) {
      await fs.mkdir(iconsDir, { recursive: true });
      console.log('Created icons directory');
    }

    // Create a play icon SVG
    const svgBuffer = Buffer.from(`
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <!-- Background with gradient -->
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#4c1d95" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood flood-color="rgba(0,0,0,0.3)" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="shadow"/>
            <feComposite in="SourceGraphic" in2="shadow" operator="over"/>
          </filter>
        </defs>
        
        <!-- Circular background -->
        <circle cx="256" cy="256" r="240" fill="url(#bgGradient)" />
        
        <!-- Play triangle -->
        <path d="M190,160 L370,256 L190,352 Z" 
              fill="white" 
              filter="url(#shadow)" />
      </svg>
    `);
    
    // Generate 192x192 play icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('public/icons/play.png');
      
    // Generate 512x512 play icon for higher resolution devices
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile('public/icons/play-512.png');
      
    console.log('Play icons generated successfully!');
  } catch (error) {
    console.error('Error generating play icon:', error);
  }
}

generatePlayIcon();
