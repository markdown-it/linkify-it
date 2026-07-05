import { LinkifyIt } from '../../../src/index.ts'
const linkify = new LinkifyIt()

linkify.test('')

export function run (data) {
  return linkify.test(data)
}
