import { createRequire } from 'module'
import assert from 'node:assert'
import { describe, it } from 'node:test'

const require = createRequire(import.meta.url)

function checkBuild (pkg) {
  assert.strictEqual(typeof pkg.LinkifyIt, 'function')
  assert.strictEqual(typeof pkg.linkifyit, 'function')
  assert.strictEqual(typeof pkg.REBuilder, 'function')

  {
    const l = new pkg.LinkifyIt({ fuzzyLink: true })

    l.tlds('myroot', true)

    assert.ok(l.test('google.myroot'))
    assert.ok(!l.test('google.xyz'))
  }

  {
    const l = pkg.linkifyit({ fuzzyLink: true })

    l.tlds('myroot', true)

    assert.ok(l.test('google.myroot'))
    assert.ok(!l.test('google.xyz'))
  }
}

describe('build', () => {
  it('CJS', () => {
    const pkg = require('../build/index.cjs.js')

    checkBuild(pkg)
  })

  it('ESM', async () => {
    const pkg = await import('../build/index.mjs')

    checkBuild(pkg)
  })

  it('package require', () => {
    const pkg = require('../')

    checkBuild(pkg)
  })
})
