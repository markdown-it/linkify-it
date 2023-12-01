'use strict'
/* eslint-env mocha */

const linkify = require('../')
const assert = require('assert')

describe('CJS', () => {
  it('require', () => {
    const l = linkify()

    l.tlds('myroot', true)

    assert.ok(l.test('google.myroot'))
    assert.ok(!l.test('google.xyz'))
  })
})
