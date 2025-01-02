import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BlocksDoku',
        short_name: 'BlocksDoku',
        description: 'A simple block puzzle game.',
        theme_color: '#3030ff',
      },
    })
  ]
})
