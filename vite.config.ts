import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Static hosts like GitHub Pages have no rewrites, so /pizza/ only works if a file is
 * there. A copy of index.html per route answers with 200, which matters inside an app's
 * webview (a 404 can be treated as a failed load), and 404.html catches anything else.
 * Asset URLs in index.html are absolute (under BASE_URL), so the copies work as-is.
 */
function routePages(routes: string[]): Plugin {
  let outDir = 'dist'
  return {
    name: 'route-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const index = join(outDir, 'index.html')
      for (const route of routes) {
        mkdirSync(join(outDir, route), { recursive: true })
        copyFileSync(index, join(outDir, route, 'index.html'))
      }
      copyFileSync(index, join(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  // GitHub Pages serves a project site from /<repo>/, not the domain root, so a deploy
  // sets PAGES_BASE. Vite rewrites asset URLs with it and exposes it as
  // import.meta.env.BASE_URL, which is how the games find their data. "/" locally.
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react(), routePages(['pizza', 'closer'])],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Closer's integration tests walk a 105,000-word vocabulary across 216 puzzle files.
    // Comfortable on a dev machine, several times slower on a CI runner.
    testTimeout: 30_000,
  },
})
