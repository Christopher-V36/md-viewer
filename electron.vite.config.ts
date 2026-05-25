import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: { entry: 'src/main/index.ts' }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: { entry: 'src/preload/index.ts' }
    }
  },
  renderer: {
    root: resolve('src/renderer'),
    server: { port: 5174, strictPort: true },
    build: {
      rollupOptions: {
        input: resolve('src/renderer/index.html')
      }
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    }
  }
})
