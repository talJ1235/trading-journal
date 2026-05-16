import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Trading Journal',
        short_name: 'Trading Journal',
        description: 'Personal trading journal PWA',
        theme_color: '#0F0F0F',
        background_color: '#0F0F0F',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // null = SW does not intercept navigations; browser fetches from network naturally.
        // offline.html is only served by the explicit NetworkFirst fallback below.
        navigateFallback: null,
        offlineGoogleAnalytics: false,
        runtimeCaching: [
          {
            // Auth callback routes — never intercept, always go to network
            urlPattern: /\/auth\//,
            handler: 'NetworkOnly',
          },
          {
            // Supabase, Gemini, Finnhub — NetworkOnly (live data, never serve stale)
            urlPattern: ({ url }: { url: URL }) =>
              url.hostname.endsWith('.supabase.co') ||
              url.hostname === 'generativelanguage.googleapis.com' ||
              url.hostname === 'finnhub.io',
            handler: 'NetworkOnly',
          },
          {
            // Navigation (HTML) — NetworkFirst with 3s timeout, fallback to cache.
            // If both network and cache fail, browser shows its own error (not offline.html).
            urlPattern: ({ request }: { request: Request }) =>
              request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Static assets with content hashes — safe to serve from cache indefinitely
            urlPattern: /\.(?:js|css|woff2|png|svg|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
