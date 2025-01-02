import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Blockdoku',
        short_name: 'Blockdoku',
        description: 'A simple block puzzle game.',
        theme_color: '#3030ff',
      },
    })
  ]
})
