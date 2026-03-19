/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendOrigin = env.OPENFILTR_BACKEND_ORIGIN || 'http://localhost:3000'

  return {
    plugins: [
      vue(),
      legacy()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api/v1': {
          target: backendOrigin,
          changeOrigin: true,
        },
        '/openapi.yaml': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom'
    }
  }
})
