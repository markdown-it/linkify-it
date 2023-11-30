#!/usr/bin/env node
/*eslint-disable no-console*/

import { readFileSync } from 'fs'
import linkifyit from '../index.mjs'

const linkify = linkifyit()

// Forse compilation
linkify.test('')

var data = readFileSync(new URL('/samples/lorem1.txt', import.meta.url), 'utf8')

for (var i = 0; i < 20; i++) {
  console.log(linkify.match(data))
}
