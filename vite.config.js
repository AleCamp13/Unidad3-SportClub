import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'
import { viteServer } from './src/config/viteServer.js'

export default defineConfig({
  plugins: [react()],
  server: viteServer,
  test: {
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
  },
})
