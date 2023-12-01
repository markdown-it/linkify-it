#!/usr/bin/env node

// Generates list of 2-char english tlds.
//
// Code is dirty, i know, but it's needed only once
//

/* eslint-disable no-console */

import { createRequire } from 'node:module'

const tldList = createRequire(import.meta.url)('tlds')

function toRanges (str) {
  const ranges = []

  str = str.slice(1, -1)

  while (str.length) {
    for (let i = 1; ; i++) {
      if (str[i] !== String.fromCharCode(str[i - 1].charCodeAt(0) + 1)) {
        if (i < 3) {
          ranges.push(str.slice(0, i))
        } else {
          ranges.push(str[0] + '-' + str[i - 1])
        }
        str = str.slice(i)
        break
      }
    }
  }
  return '[' + ranges.join('') + ']'
}

const tlds = tldList.filter(name => /^[a-z]{2}$/.test(name)).sort()

//
// group by first letter
//

let result = []

'abcdefghijklmnopqrstuvwxyz'.split('').forEach(letter => {
  const list = tlds.filter(name => name[0] === letter)

  if (!list.length) { return }

  if (list.length < 2) {
    result = result.concat(list)
    return
  }

  result.push(letter + '[' + list.map(n => n[1]).join('') + ']')
})

result = result.join('|')

console.log(result)

//
// Compact ranges
//

result = result.replace(/\[[a-z]+\]/g, toRanges)

// console.log(result);
