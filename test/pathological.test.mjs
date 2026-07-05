import { describe, it } from 'node:test'
import { LinkifyIt } from '../src/index.ts'

describe('pathological cases', function () {
  it('should not hang on fuzzy links followed by an email marker', { timeout: 10000 }, function () {
    // ~1 MiB input
    new LinkifyIt().match(`${'a.com '.repeat(174762)}@`)
  })

  it('should not hang on fuzzy emails followed by a link marker', { timeout: 10000 }, function () {
    // ~1 MiB input
    new LinkifyIt().match(`${'a@b.com '.repeat(131071)}.com`)
  })

  it('should not hang on repeated "mailto:" schema prefixes', { timeout: 10000 }, function () {
    // ~250 KiB input. The `:` in mailto's prefix is also a valid email-name
    // char, so `mailto:mailto:...` chains into O(n) schema hits, each running
    // the mailto validator to the end of the tail => O(n^2) without a fix.
    new LinkifyIt().match('mailto:'.repeat(100000))
  })
})
