import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/dungleboy/',
  server: {
    port: 5173,
  },
  test: {
    environment: 'node',
  },
})
