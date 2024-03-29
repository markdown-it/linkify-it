#!/usr/bin/env node
/* eslint-disable no-console */

import { readFileSync } from 'fs'
import linkifyit from '../index.mjs'

const linkify = linkifyit()

// Force compilation
linkify.test('')

const data = readFileSync(new URL('/samples/lorem1.txt', import.meta.url), 'utf8')

for (let i = 0; i < 20; i++) {
  console.log(linkify.match(data))
}
