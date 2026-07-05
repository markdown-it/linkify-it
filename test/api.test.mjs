import { readFileSync } from 'fs'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { LinkifyIt } from '../src/index.ts'

let lines

describe('links', function () {
  const l = new LinkifyIt({ fuzzyLink: true, fuzzyIP: true })

  l.normalize = function () {} // kill normalizer

  lines = readFileSync(new URL('fixtures/links.txt', import.meta.url), 'utf8').split(/\r?\n/g)

  let skipNext = false

  lines.forEach(function (line, idx) {
    if (skipNext) {
      skipNext = false
      return
    }

    line = line.replace(/^%.*/, '')

    const next = (lines[idx + 1] || '').replace(/^%.*/, '')

    if (!line.trim()) { return }

    if (next.trim()) {
      it(`line ${idx + 1}`, function () {
        assert.ok(l.pretest(line), `(pretest failed in \`${line}\`)`)
        assert.ok(l.test(`\n${line}\n`), `(link not found in \`\\n${line}\\n\`)`)
        assert.ok(l.test(line), `(link not found in \`${line}\`)`)
        assert.strictEqual(l.match(line)[0].url, next)
      })
      skipNext = true
    } else {
      it(`line ${idx + 1}`, function () {
        assert.ok(l.pretest(line), `(pretest failed in \`${line}\`)`)
        assert.ok(l.test(`\n${line}\n`), `(link not found in \`\\n${line}\\n\`)`)
        assert.ok(l.test(line), `(link not found in \`${line}\`)`)
        assert.strictEqual(l.match(line)[0].url, line)
      })
    }
  })
})

describe('not links', function () {
  const l = new LinkifyIt()

  l.normalize = function () {} // kill normalizer

  lines = readFileSync(new URL('fixtures/not_links.txt', import.meta.url), 'utf8').split(/\r?\n/g)

  lines.forEach(function (line, idx) {
    line = line.replace(/^%.*/, '')

    if (!line.trim()) { return }

    it(`line ${idx + 1}`, function () {
      assert.ok(!l.test(line),
        `(should not find link in \`${line}\`, but found \`` +
        `${JSON.stringify((l.match(line) || [])[0])}\`)`)
    })
  })
})

describe('API', function () {
  it('extend tlds', function () {
    const l = new LinkifyIt({ fuzzyLink: true })

    assert.ok(!l.test('google.myroot'))

    l.tlds('myroot', true)

    assert.ok(l.test('google.myroot'))
    assert.ok(!l.test('google.xyz'))

    l.tlds(['xyz'])

    assert.ok(l.test('google.xyz'))
    assert.ok(!l.test('google.myroot'))
  })

  it('add rule with default normalizer', function () {
    const l = new LinkifyIt({ fuzzyLink: true }).add('my:', {
      validate: function (text, pos) {
        const match = /^\/\/[a-z]+/.exec(text.slice(pos))

        return match ? match[0].length : 0
      }
    })

    const match = l.match('google.com. my:// my://asdf!')

    assert.strictEqual(match[0].text, 'google.com')
    assert.strictEqual(match[1].text, 'my://asdf')
  })

  it('add rule with normalizer', function () {
    const l = new LinkifyIt({ fuzzyLink: true }).add('my:', {
      validate: function (text, pos) {
        const match = /^\/\/[a-z]+/.exec(text.slice(pos))

        return match ? match[0].length : 0
      },
      normalize: function (m) {
        m.text = m.text.replace(/^my:\/\//, '').toUpperCase()
        m.url = m.url.toUpperCase()
      }
    })

    const match = l.match('google.com. my:// my://asdf!')

    assert.strictEqual(match[1].text, 'ASDF')
    assert.strictEqual(match[1].url, 'MY://ASDF')
  })

  it('disable rule', function () {
    const l = new LinkifyIt()

    assert.ok(l.test('http://google.com'))
    assert.ok(l.test('foo@bar.com'))
    l.add('http:', null)
    l.add('mailto:', null)
    assert.ok(!l.test('http://google.com'))
    assert.ok(!l.test('foo@bar.com'))
  })

  it('test at position', function () {
    const l = new LinkifyIt()

    assert.ok(l.testSchemaAt('http://google.com', 'http:', 5))
    assert.ok(l.testSchemaAt('http://google.com', 'HTTP:', 5))
    assert.ok(!l.testSchemaAt('http://google.com', 'http:', 6))

    assert.ok(!l.testSchemaAt('http://google.com', 'bad_schema:', 6))
  })

  it('correct cache value', function () {
    const l = new LinkifyIt({ fuzzyLink: true })

    const match = l.match('.com. http://google.com google.com ftp://google.com')

    assert.strictEqual(match[0].text, 'http://google.com')
    assert.strictEqual(match[1].text, 'google.com')
    assert.strictEqual(match[2].text, 'ftp://google.com')
  })

  it('normalize', function () {
    const l = new LinkifyIt()

    let m = l.match('mailto:foo@bar.com')[0]

    // assert.strictEqual(m.text, 'foo@bar.com');
    assert.strictEqual(m.url, 'mailto:foo@bar.com')

    m = l.match('foo@bar.com')[0]

    // assert.strictEqual(m.text, 'foo@bar.com');
    assert.strictEqual(m.url, 'mailto:foo@bar.com')
  })

  it('test @twitter rule', function () {
    const l = new LinkifyIt().add('@', {
      validate: function (text, pos, self) {
        const tail = text.slice(pos)

        if (!self.re.twitter) {
          self.re.twitter = new RegExp(
            `^([a-zA-Z0-9_]){1,15}(?!_)(?=$|${self.re.src_ZPCc})`
          )
        }
        if (self.re.twitter.test(tail)) {
          if (pos >= 2 && tail[pos - 2] === '@') {
            return 0
          }
          return tail.match(self.re.twitter)[0].length
        }
        return 0
      },
      normalize: function (m) {
        m.url = `https://twitter.com/${m.url.replace(/^@/, '')}`
      }
    })

    assert.strictEqual(l.match('hello, @gamajoba_!')[0].text, '@gamajoba_')
    assert.strictEqual(l.match(':@givi')[0].text, '@givi')
    assert.strictEqual(l.match(':@givi')[0].url, 'https://twitter.com/givi')
    assert.ok(!l.test('@@invalid'))
  })

  it('set option: fuzzyLink', function () {
    const l = new LinkifyIt()

    assert.strictEqual(l.test('google.com.'), false)

    l.set({ fuzzyLink: true })

    assert.strictEqual(l.test('google.com.'), true)
    assert.strictEqual(l.match('google.com.')[0].text, 'google.com')
  })

  it('set option: fuzzyEmail', function () {
    const l = new LinkifyIt({ fuzzyEmail: false })

    assert.strictEqual(l.test('foo@bar.com.'), false)

    l.set({ fuzzyEmail: true })

    assert.strictEqual(l.test('foo@bar.com.'), true)
    assert.strictEqual(l.match('foo@bar.com.')[0].text, 'foo@bar.com')
  })

  it('set option: fuzzyIP', function () {
    const l = new LinkifyIt({ fuzzyLink: true })

    assert.strictEqual(l.test('1.1.1.1.'), false)

    l.set({ fuzzyIP: true })

    assert.strictEqual(l.test('1.1.1.1.'), true)
    assert.strictEqual(l.match('1.1.1.1.')[0].text, '1.1.1.1')
  })

  it('should not hang in fuzzy mode with sequences of astrals', function () {
    const l = new LinkifyIt()

    l.set({ fuzzyLink: true })

    l.match('😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡 .com')
  })

  it('should accept `---` if enabled', function () {
    let l = new LinkifyIt()

    assert.strictEqual(l.match('http://e.com/foo---bar')[0].text, 'http://e.com/foo---bar')
    assert.strictEqual(l.match('text@example.com---foo'), null)

    l = new LinkifyIt({ '---': true })

    assert.strictEqual(l.match('http://e.com/foo---bar')[0].text, 'http://e.com/foo')
    assert.strictEqual(l.match('text@example.com---foo')[0].text, 'text@example.com')
  })

  it('should find a match at the start', function () {
    const l = new LinkifyIt()

    l.set({ fuzzyLink: true })

    assert.strictEqual(l.matchAtStart('http://google.com 123').text, 'http://google.com')
    assert.ok(!l.matchAtStart('google.com 123'))
    assert.ok(!l.matchAtStart('  http://google.com 123'))
  })

  it('matchAtStart should not interfere with normal match', function () {
    const l = new LinkifyIt()
    let str

    str = 'http://google.com http://google.com'
    assert.ok(l.matchAtStart(str))
    assert.strictEqual(l.match(str).length, 2)

    str = 'aaa http://google.com http://google.com'
    assert.ok(!l.matchAtStart(str))
    assert.strictEqual(l.match(str).length, 2)
  })

  it('should not match incomplete links', function () {
    // regression test for https://github.com/markdown-it/markdown-it/issues/868
    const l = new LinkifyIt()

    assert.ok(!l.matchAtStart('http://'))
    assert.ok(!l.matchAtStart('https://'))
  })
})
