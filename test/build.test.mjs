import { describe, it } from 'node:test'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('../')
const { LinkifyIt } = pkg
const assert = require('assert')

describe('CJS', () => {
  it('require', () => {
    const l = new LinkifyIt({ fuzzyLink: true })

    l.tlds('myroot', true)

    assert.ok(l.test('google.myroot'))
    assert.ok(!l.test('google.xyz'))
  })
})
