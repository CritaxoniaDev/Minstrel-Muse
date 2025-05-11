import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { createHtmlPlugin } from 'vite-plugin-html'

// List of packages that depend on React and should be bundled with it
const reactDependentPackages = [
  'react',
  'react-dom',
  'scheduler',
  'prop-types',
  'use-callback-ref',
  'react-router',
  'react-router-dom',
  'react-is',
  '@emotion',
  'framer-motion',
  'react-transition-group',
  'react-responsive',
  'react-hook-form',
  'next-themes',
  'lucide-react',
  '@radix-ui',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'cmdk',
  'sonner',
  'zustand',
  'jotai',
  'recoil',
  'swr',
  'react-query',
  'formik',
  'react-select',
  'react-table',
  'react-dnd',
  'react-beautiful-dnd',
  'react-dropzone',
  'react-spring',
  'react-motion',
  'react-virtualized',
  'react-window',
  'react-intersection-observer',
  'react-use',
  'use-',  // Prefix for many React hook libraries
  '@floating-ui',
  '@headlessui',
  '@hookform',
  '@tanstack'
];

export default defineConfig({
  plugins: [
    react(),
    // HTML minification plugin
    // createHtmlPlugin({
    //   minify: true,
    //   minifyOptions: {
    //     collapseWhitespace: true,
    //     removeComments: true,
    //     removeRedundantAttributes: true,
    //     removeScriptTypeAttributes: true,
    //     removeStyleLinkTypeAttributes: true,
    //     useShortDoctype: true,
    //     minifyCSS: true,
    //     minifyJS: true
    //   },
    //   inject: {
    //     data: {
    //       title: 'MinstrelMuse',
    //       buildTime: new Date().toISOString(),
    //     },
    //   },
    // }),
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
          // Check if the module is from node_modules
          if (id.includes('node_modules/')) {
            // Extract the package name from the path
            const matches = id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
            if (matches && matches[1]) {
              const packageName = matches[1];
              
              // Check if this package should be bundled with React
              const shouldBundleWithReact = reactDependentPackages.some(pkg => {
                if (pkg.endsWith('-')) {
                  // Handle prefix matching (e.g., 'use-')
                  return packageName.startsWith(pkg);
                }
                return packageName === pkg || packageName.startsWith(`${pkg}/`);
              });
              
              if (shouldBundleWithReact) {
                return 'vendor-react-ecosystem';
              }
              
              // Firebase packages in their own chunk
              if (packageName === 'firebase' || packageName.startsWith('firebase/')) {
                return 'vendor-firebase';
              }
              
              // UI/component libraries that might not directly depend on React
              if (packageName.includes('ui') || packageName.includes('component')) {
                return 'vendor-ui';
              }
              
              // Utility libraries
              if (packageName.includes('util') || packageName.includes('helper') || 
                  packageName.includes('tool') || packageName.includes('lib')) {
                return 'vendor-utils';
              }
              
              // For all other packages, create individual chunks
              // Replace @ and / with - to create valid chunk names
              const safePackageName = packageName.replace(/^@/, '').replace(/\//g, '-');
              return `npm-${safePackageName}`;
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
