#!/usr/bin/env node

import { createRequire } from 'node:module'
import { rmSync } from 'node:fs'
import { build } from 'vite'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

rmSync('build', { recursive: true, force: true })

await build({
  configFile: false,
  logLevel: 'info',
  build: {
    outDir: 'build',
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: 'index.mjs',
      formats: ['cjs'],
      fileName: () => 'index.cjs.js'
    },
    rolldownOptions: {
      external: Object.keys(pkg.dependencies)
    }
  }
})
