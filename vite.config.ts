import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // GitHub Pages serves a project site from /<repo>/, not the domain root, so a deploy
  // sets PAGES_BASE. Vite rewrites asset URLs with it and exposes it as
  // import.meta.env.BASE_URL, which is how the games find their data. "/" locally.
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Closer's integration tests walk a 105,000-word vocabulary across 216 puzzle files.
    // Comfortable on a dev machine, several times slower on a CI runner.
    testTimeout: 30_000,
  },
})
