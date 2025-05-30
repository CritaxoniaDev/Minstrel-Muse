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
          maximumFileSizeToCacheInBytes: 10000000,
          // Enhanced offline caching strategies
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot,json}'],
          // Add offline page to precache
          additionalManifestEntries: [
            { url: '/offline', revision: null }
          ],
          // Add offline fallback
          navigateFallback: '/offline',
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
          // Skip waiting for immediate activation
          skipWaiting: true,
          clientsClaim: true
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
          // Add offline capability to manifest
          categories: ['music', 'entertainment'],
          lang: 'en',
          dir: 'ltr',
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
          ],
          // Add shortcuts for offline functionality
          shortcuts: [
            {
              name: 'Library',
              short_name: 'Library',
              description: 'Access your music library',
              url: '/dashboard/library',
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Player',
              short_name: 'Player',
              description: 'Music player',
              url: '/dashboard/player',
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        // Development options
        devOptions: {
          enabled: !isProduction,
          type: 'module'
        }
      }),
      // Custom plugin to inline CSS with minification
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
            
            // Minify CSS content
            const minifiedCss = cssContent
              .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '') // Remove comments and whitespace
              .replace(/ {2,}/g, ' ') // Remove multiple spaces
              .replace(/([{:}])\s+/g, '$1') // Remove spaces after {, :, }
              .replace(/\s+([{:}])/g, '$1') // Remove spaces before {, :, }
              .replace(/;}/g, '}') // Remove trailing semicolons
            
            // Replace the placeholder with the minified CSS content
            return html.replace('/* CSS_PLACEHOLDER */', minifiedCss)
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
      },
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
      // Selective minification configuration
      minify: true, // Default is false for app code
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
      // Custom Rollup plugin to minify vendor and app-core chunks
      plugins: [
        {
          name: 'minify-sensitive-chunks',
          generateBundle(options, bundle) {
            const { minify } = require('terser');
            
            // Process each chunk
            Object.keys(bundle).forEach(async (fileName) => {
              const chunk = bundle[fileName];
              
              // Only process JS chunks that are vendor chunks or app-core chunks
              if (fileName.endsWith('.js') && (fileName.includes('vendor') || fileName.includes('app-core'))) {
                try {
                  // Minify the chunk with enhanced obfuscation for app-core
                  const result = await minify(chunk.code, {
                    compress: {
                      drop_console: true,
                      drop_debugger: true,
                      passes: 2, // Multiple passes for better compression
                    },
                    format: {
                      comments: false
                    }
                  });
                  
                  // Update the chunk with minified code
                  if (result.code) {
                    chunk.code = result.code;
                  }
                } catch (err) {
                  console.error(`Error minifying ${fileName}:`, err);
                }
              }
            });
          }
        }
      ]
    }
  }
})
