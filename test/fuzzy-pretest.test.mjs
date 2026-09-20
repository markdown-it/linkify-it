import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { LinkifyIt } from '../src/index.ts'

describe('fuzzyLink host pretest (#126)', function () {
  const l = new LinkifyIt({ fuzzyLink: true })

  it('rejects plain prose without a host-like token', function () {
    const plain = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.'.repeat(8)
    assert.equal(l.test(plain), false)
    assert.equal(l.match(plain), null)
  })

  it('still finds schemaless links when a TLD is present', function () {
    assert.equal(l.test('visit github.com today'), true)
    const m = l.match('visit github.com today')
    assert.ok(m)
    assert.equal(m[0].url, 'http://github.com')
  })

  it('still finds www. links', function () {
    assert.equal(l.test('see www.example.org/path'), true)
    const m = l.match('see www.example.org/path')
    assert.ok(m)
    assert.equal(m[0].url, 'http://www.example.org/path')
  })

  it('still finds fuzzy IP links when fuzzyIP is enabled', function () {
    const lip = new LinkifyIt({ fuzzyLink: true, fuzzyIP: true })
    assert.equal(lip.test('ping 192.168.1.1 now'), true)
  })
})
