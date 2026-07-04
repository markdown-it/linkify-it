import { LinkifyIt } from '../../../index.mjs'
const linkify = new LinkifyIt()

linkify.test('')

export function run (data) {
  return linkify.test(data)
}
