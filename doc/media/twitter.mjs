import { LinkifyIt } from 'linkify-it'

const linkify = new LinkifyIt()

const twitter = new RegExp(
  `([a-zA-Z0-9_]){1,15}(?!_)(?=$|${linkify.re.src_ZPCc})`,
  'y'
)

linkify.add('@', {
  validate: (text, pos) => {
    twitter.lastIndex = pos

    const match = twitter.exec(text)
    if (!match) return 0

    // Linkifier allows punctuation chars before prefix,
    // but we additionally disable `@` (`@@mention` is invalid).
    if (pos >= 2 && text[pos - 2] === '@') return 0

    return match[0].length
  },
  normalize: match => {
    match.url = `https://twitter.com/${match.url.replace(/^@/, '')}`
  }
})

console.log(linkify.match('hello, @gamajoba_!'))
