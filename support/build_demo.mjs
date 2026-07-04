#!/usr/bin/env node

import { readFileSync } from 'fs'
import { build } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

function escape (input) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    // .replaceAll("'", '&#039;');
}

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

await build({
  root: 'support/demo_template',
  configFile: false,
  plugins: [
    {
      name: 'inject-sample',
      transformIndexHtml: html => html.replace('<!--SAMPLE-->', escape(sample))
    },
    viteSingleFile({ removeViteModuleLoader: true })
  ],
  build: {
    outDir: '../../demo',
    emptyOutDir: true
  }
})
