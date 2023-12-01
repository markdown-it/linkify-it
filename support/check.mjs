#!/usr/bin/env node

//
// Simple CLI helper for quick-check patterns
//

/* eslint-disable no-console */

import linkifyit from '../index.mjs'
import { inspect } from 'node:util'
const linkify = linkifyit()

const text = [].concat(process.argv.slice(2)).join(' ')

console.log(text)
console.log(linkify.test(text))
console.log('----------------')
console.log(inspect(linkify, { depth: 0 }))
console.log('----------------')
console.log(inspect(linkify.match(text)))
console.log('----------------')
console.log(inspect(linkify, { depth: 0 }))
