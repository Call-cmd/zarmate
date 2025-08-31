// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ZarMate Merchant Dashboard',
    short_name: 'ZarMate',
    description: 'The merchant dashboard for ZarMate payments and analytics.',
    start_url: '/', // Start users at the dashboard after login
    display: 'standalone',
    background_color: '#041827', // Your app's background color
    theme_color: '#072f39', // Your app's theme color
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}