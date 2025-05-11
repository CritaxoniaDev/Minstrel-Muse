import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    react(),
    // HTML minification plugin
    createHtmlPlugin({
      minify: true,
      minifyOptions: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
      },
      inject: {
        data: {
          title: 'MinstrelMuse',
          buildTime: new Date().toISOString(),
        },
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000
      },
      manifest: {
        name: 'MinstrelMuse',
        short_name: 'MinstrelMuse',
        description: 'Music streaming application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 100000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Special handling for React and related packages to prevent the forwardRef error
          // Keep React and its ecosystem in a single chunk
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/scheduler') ||
              id.includes('node_modules/prop-types')) {
            return 'vendor-react';
          }
          
          // For all other node_modules, create individual chunks by package name
          if (id.includes('node_modules/')) {
            // Extract the package name from the path
            const matches = id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
            if (matches && matches[1]) {
              // Create a chunk name based on the package name
              // Replace @ and / with - to create valid chunk names
              const packageName = matches[1].replace(/^@/, '').replace(/\//g, '-');
              return `npm-${packageName}`;
            }
          }
          
          // Group application code by directory
          if (id.includes('/src/components/')) {
            return 'app-components';
          }
          
          if (id.includes('/src/pages/')) {
            return 'app-pages';
          }
          
          if (id.includes('/src/hooks/')) {
            return 'app-hooks';
          }
          
          if (id.includes('/src/utils/')) {
            return 'app-utils';
          }
          
          // Default chunk for other app code
          if (id.includes('/src/')) {
            return 'app-core';
          }
        }
      },
    },
  }
})
