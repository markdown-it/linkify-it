import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'support/demo_template/index.mjs',
    output: {
      file: 'demo/index.js',
      format: 'iife',
      name: 'demo'
    },
    plugins: [
      resolve()
    ]
  }
]
