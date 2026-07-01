#!/usr/bin/env node

import { execFileSync } from 'child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'

function escape (input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    // .replaceAll("'", '&#039;');
}

rmSync('demo', { force: true, recursive: true })
mkdirSync('demo')

copyFileSync('support/demo_template/index.css', 'demo/index.css')

// Read html template and inject escaped sample
const html = readFileSync('support/demo_template/index.html', 'utf8')

let sample_links = readFileSync('test/fixtures/links.txt', 'utf8')

// Cleanup
const lines = sample_links.split(/\r?\n/g)
const result = []
function isComment (str) { return /^%.*/.test(str) }
function isEmpty (str) { return !(str && str.trim()) }

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

sample_links = result.join('\n')

const sample_not_links = readFileSync('test/fixtures/not_links.txt', 'utf8')

const sample =
`${sample_links}


${sample_not_links}`

const output = html.replace('<!--SAMPLE-->', escape(sample))
writeFileSync('demo/index.html', output)

execFileSync('node_modules/.bin/rollup', ['-c', 'support/demo_template/rollup.config.mjs'], { stdio: 'inherit' })
