#!/usr/bin/env node
import { readFileSync } from 'fs'
import { LinkifyIt } from '../src/index.ts'

const linkify = new LinkifyIt()

// Force compilation
linkify.test('')

const data = readFileSync(new URL('/samples/lorem1.txt', import.meta.url), 'utf8')

for (let i = 0; i < 20; i++) {
  console.log(linkify.match(data))
}
