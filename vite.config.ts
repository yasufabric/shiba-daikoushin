import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/shiba-daikoushin/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
