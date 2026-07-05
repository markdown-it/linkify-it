#!/usr/bin/env node

import { createRequire } from 'node:module'
import { rmSync } from 'node:fs'
import { build } from 'vite'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const common = {
  configFile: false,
  logLevel: 'info',
  build: {
    outDir: 'build',
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    rolldownOptions: {
      external: Object.keys(pkg.dependencies)
    }
  }
}

rmSync('build', { recursive: true, force: true })

await build({
  ...common,
  build: {
    ...common.build,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.mjs'
    }
  }
})

await build({
  ...common,
  build: {
    ...common.build,
    target: 'es2015',
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.cjs.js'
    }
  }
})
