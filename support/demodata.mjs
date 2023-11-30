#!/usr/bin/env node

// Build demo data for embedding into html

/*eslint no-console:0*/

import { readFileSync } from 'fs'

function isComment(str) { return /^%.*/.test(str) }
function isEmpty(str) { return !(str && str.trim()) }

let result = []

// Read links fixture
let lines = readFileSync(new URL('../test/fixtures/links.txt', import.meta.url), 'utf8').split(/\r?\n/g)

// Cleanup
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  if (isComment(line)) {
    result.push(line)
    continue
  }

  if (isEmpty(line)) {
    if (isComment(lines[i + 1])) {
      result.push('')
    }
    continue
  }

  result.push(line)

  if (!isComment(lines[i + 1]) && !isEmpty(lines[i + 1])) {
    i++
  }
}

result.push('')
result.push('')

// Read non-links fixture
lines = readFileSync(new URL('../test/fixtures/not_links.txt', import.meta.url), 'utf8').split(/\r?\n/g)

result = result.concat(lines)

// Join lines
result = result.join('\n')

console.log(JSON.stringify({
  self: {
    demo: {
      source: result
    }
  }
}, null, 2))
