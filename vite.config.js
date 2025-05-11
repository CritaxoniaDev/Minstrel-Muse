import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { createHtmlPlugin } from 'vite-plugin-html'
import { readFileSync } from 'fs'

export default defineConfig(({ command }) => {
  const isProduction = command === 'build'
  
  return {
    plugins: [
      react(),
      // HTML plugin with minification disabled
      createHtmlPlugin({
        minify: false, // Disabled HTML minification
        inject: {
          data: {
            title: 'MinstrelMuse',
            buildTime: new Date().toISOString(),
          },
          // This will be used to inject the CSS content
          tags: isProduction ? [
            {
              injectTo: 'head',
              tag: 'style',
              attrs: {
                type: 'text/css'
              },
              // This will be replaced with actual CSS content in the transform hook
              children: '/* CSS_PLACEHOLDER */'
            }
          ] : []
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
      }),
      // Custom plugin to inline CSS
      {
        name: 'vite-plugin-inline-css',
        apply: 'build',
        enforce: 'post',
        transformIndexHtml: {
          order: 'post',
          handler(html, { bundle }) {
            if (!bundle) return html
            
            // Find the CSS file in the bundle
            const cssFile = Object.keys(bundle).find(file => file.endsWith('.css'))
            if (!cssFile || !bundle[cssFile]) return html
            
            // Get the CSS content
            const cssContent = bundle[cssFile].source
            
            // Replace the placeholder with the actual CSS content
            return html.replace('/* CSS_PLACEHOLDER */', cssContent)
          }
        },
        generateBundle(options, bundle) {
          // Remove the CSS files from the bundle since they're now inlined
          Object.keys(bundle).forEach(fileName => {
            if (fileName.endsWith('.css')) {
              delete bundle[fileName]
            }
          })
        }
      }
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
      minify: false, // Disabled JS minification
      cssCodeSplit: false, // This ensures CSS is extracted to a single file first (which we'll then inline)
      rollupOptions: {
        output: {
          // Use a function-based approach for manualChunks
          manualChunks: (id) => {
            // All node_modules in a single vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            
            // Application code in a few chunks
            if (id.includes('/src/components/')) {
              return 'app-components';
            }
            
            if (id.includes('/src/pages/')) {
              return 'app-pages';
            }
            
            // Default app chunk
            if (id.includes('/src/')) {
              return 'app-core';
            }
          }
        },
      },
    }
  }
})
