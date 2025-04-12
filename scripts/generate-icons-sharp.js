import sharp from 'sharp';
import fs from 'fs/promises';

async function generateIcons() {
  try {
    // Create a 512x512 advanced design with multiple effects
    const svgBuffer = Buffer.from(`
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <!-- Definitions for filters and gradients -->
        <defs>
          <!-- Rich purple gradient background -->
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="50%" stop-color="#7c3aed" />
            <stop offset="100%" stop-color="#4c1d95" />
          </radialGradient>
          
          <!-- Outer glow effect -->
          <filter id="outerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feFlood flood-color="#c4b5fd" flood-opacity="0.5" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="glow"/>
            <feComposite in="glow" in2="SourceGraphic" operator="over"/>
          </filter>
          
          <!-- Inner shadow for depth -->
          <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="3" />
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feFlood flood-color="rgba(0,0,0,0.3)" result="color"/>
            <feComposite in="color" in2="blur" operator="in" result="shadow"/>
            <feComposite in="SourceGraphic" in2="shadow" operator="over"/>
          </filter>
          
          <!-- Texture pattern -->
          <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.07)"/>
          </pattern>
        </defs>
        
        <!-- Main background with rounded corners -->
        <rect width="512" height="512" rx="100" ry="100" fill="url(#bgGradient)"/>
        
        <!-- Texture overlay -->
        <rect width="512" height="512" rx="100" ry="100" fill="url(#pattern)"/>
        
        <!-- Decorative elements -->
        <circle cx="256" cy="256" r="200" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8" />
        <circle cx="256" cy="256" r="180" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="12" />
        
        <!-- Animated-looking wave effect -->
        <path d="M 100,256 C 150,200 200,180 256,180 C 312,180 362,200 412,256" 
              fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="6" stroke-linecap="round" />
        <path d="M 100,276 C 150,330 200,350 256,350 C 312,350 362,330 412,276" 
              fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="6" stroke-linecap="round" />
        
        <!-- Central highlight circle -->
        <circle cx="256" cy="256" r="120" fill="rgba(255,255,255,0.05)" filter="url(#innerShadow)" />
        
        <!-- Main text with effects -->
        <text x="50%" y="52%" font-family="'Arial', sans-serif" font-size="150" font-weight="bold" 
              fill="white" text-anchor="middle" dominant-baseline="middle" filter="url(#outerGlow)">MM</text>
        
        <!-- Subtle accent dot -->
        <circle cx="320" cy="200" r="15" fill="#f0abfc" filter="url(#outerGlow)" />
        
        <!-- Bottom text -->
        <text x="50%" y="85%" font-family="'Arial', sans-serif" font-size="32" font-weight="normal" 
              fill="rgba(255,255,255,0.8)" text-anchor="middle">MinstrelMuse</text>
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
      
    // Generate favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('public/favicon.png');
      
    console.log('PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
