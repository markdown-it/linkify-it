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

  it('should not hang on repeated "mailto:" schema prefixes', function () {
    // ~250 KiB input. The `:` in mailto's prefix is also a valid email-name
    // char, so `mailto:mailto:...` chains into O(n) schema hits, each running
    // the mailto validator to the end of the tail => O(n^2) without a fix.
    linkify().match('mailto:'.repeat(100000))
  }).timeout(10000)
})
