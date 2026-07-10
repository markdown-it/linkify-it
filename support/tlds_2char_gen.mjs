#!/usr/bin/env node

// Generates list of 2-char english tlds.
//
// Code is dirty, i know, but it's needed only once
//

import { createRequire } from 'node:module'

const tldList = createRequire(import.meta.url)('tlds')

const tlds = tldList.filter(name => /^[a-z]{2}$/.test(name)).sort()

//
// group by first letter
//

let result = []

'abcdefghijklmnopqrstuvwxyz'.split('').forEach(letter => {
  const list = tlds.filter(name => name[0] === letter)

  if (!list.length) { return }

  result.push(`${letter}:${list.map(n => n[1]).join('')}`)
})

result = result.join('|')

console.log(result)
