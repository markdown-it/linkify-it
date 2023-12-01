import resolve from '@rollup/plugin-node-resolve'
import { createRequire } from 'module'

const deps = createRequire(import.meta.url)('../package.json').dependencies

export default [
  {
    input: 'index.mjs',
    output: {
      file: 'build/index.cjs.js',
      format: 'cjs'
    },
    external: Object.keys(deps),
    plugins: [
      resolve()
    ]
  }
]
