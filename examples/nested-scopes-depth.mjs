import { LinkifyIt, REBuilder } from 'linkify-it'

class DeeperScopes extends REBuilder {
  nestedPairRE (open, close, depth = 8) {
    return super.nestedPairRE(open, close, depth)
  }
}

const linkify = new LinkifyIt({
  rebuilder: new DeeperScopes()
})

const sample = 'https://latex.codecogs.com/svg.latex?x=\\sqrt{\\sqrt{\\sqrt{\\sqrt{\\sqrt{x}}}}}'

console.log(linkify.match(sample)[0].text)
