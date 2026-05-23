/* eslint-env mocha */

import linkify from '../index.mjs'

describe('pathological cases', function () {
  it('should not hang on fuzzy links followed by an email marker', function () {
    // ~1 MiB input
    linkify().match('a.com '.repeat(174762) + '@')
  }).timeout(10000)

  it('should not hang on fuzzy emails followed by a link marker', function () {
    // ~1 MiB input
    linkify().match('a@b.com '.repeat(131071) + '.com')
  }).timeout(10000)
})
