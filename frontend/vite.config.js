import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'katrina-prayer-explanation-identified.trycloudflare.com',
      'mins-translated-fragrance-electoral.trycloudflare.com',
      'opinions-finally-golden-tips.trycloudflare.com',
    ],
  },
})
