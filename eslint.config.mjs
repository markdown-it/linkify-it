import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['browser'],
    ignores: [
      'coverage/**',
      'demo/**',
      'build/**'
    ]
  }),
  {
    rules: {
      camelcase: 'off'
    }
  }
]
