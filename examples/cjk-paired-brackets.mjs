import { LinkifyIt, REBuilder } from 'linkify-it'

class CJKPairedBrackets extends REBuilder {
  get_path_extra () {
    if (!this.cache.src_path_extra) {
      this.cache.src_path_extra = new RegExp(
        `\\（(?:(?!${this.src_ZCc}|[）]).){0,100}\\）|` +
        `\\《(?:(?!${this.src_ZCc}|[》]).){0,100}\\》|`
      )
    }

    return this.cache.src_path_extra
  }
}

const linkify = new LinkifyIt({
  rebuilder: new CJKPairedBrackets()
})

const samples = [
  'https://zh.wikipedia.org/wiki/（你让我）神魂颠倒',
  'https://zh.wikipedia.org/wiki/《BanG_Dream!》手游'
]

for (const sample of samples) {
  console.log(linkify.match(sample)[0].text)
}
