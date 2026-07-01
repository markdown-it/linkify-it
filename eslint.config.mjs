import neostandard from 'neostandard'

export default [
  ...neostandard({
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
  },
  {
    files: ['support/demo_template/**/*.mjs'],
    languageOptions: {
      globals: {
        location: 'readonly'
      }
    }
  }
]
