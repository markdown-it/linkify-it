import linkifyit from '../../../index.mjs'
const linkify = linkifyit()

linkify.test('')

export function run(data) {
  return linkify.match(data)
}
