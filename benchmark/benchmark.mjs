#!/usr/bin/env node
/* eslint no-console:0 */

import fs from 'node:fs'
import util from 'node:util'
import { do_not_optimize as doNotOptimize, measure } from 'mitata'

const WARMUP_MSEC = 250
const BENCHMARK_OPTIONS = {
  /* min_cpu_time: 1000 * 1e6,
  min_samples: 24 */
}

const IMPLS = []

for (const name of fs.readdirSync(new URL('./implementations', import.meta.url)).sort()) {
  const filepath = new URL(`./implementations/${name}/index.mjs`, import.meta.url)
  const code = await import(filepath)

  IMPLS.push({ name, code })
}

const SAMPLES = []

fs.readdirSync(new URL('./samples', import.meta.url)).sort().forEach((sample) => {
  const filepath = new URL(`./samples/${sample}`, import.meta.url)

  const content = {}

  content.string = fs.readFileSync(filepath, 'utf8')

  const title = `(${content.string.length} bytes)`

  SAMPLES.push({ name: sample.split('.')[0], filename: sample, title, content })
})

function formatNumber (num) {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function relativeStandardError (samples, mean) {
  if (samples.length < 2 || mean === 0) return 0

  const variance = samples.reduce((acc, sample) => {
    return acc + (sample - mean) ** 2
  }, 0) / (samples.length - 1)

  return (Math.sqrt(variance) / Math.sqrt(samples.length) / mean) * 100
}

function formatRun (run) {
  if (run.error) return `${run.name}: error`

  const stats = run.stats
  const throughput = 1e9 / stats.avg

  return [
    run.name,
    `${formatNumber(throughput)} ops/sec`,
    `+/-${relativeStandardError(stats.samples, stats.avg).toFixed(2)}%`,
    `${formatNumber(stats.ticks)} samples`
  ].join(' ')
}

function warmup (impl, data) {
  const started = performance.now()

  do {
    doNotOptimize(impl.code.run(data))
  } while (performance.now() - started < WARMUP_MSEC)
}

function select (patterns) {
  const result = []

  if (!(patterns instanceof Array)) {
    patterns = [patterns]
  }

  function checkName (name) {
    return patterns.length === 0 || patterns.some(function (regexp) {
      return regexp.test(name)
    })
  }

  SAMPLES.forEach(function (sample) {
    if (checkName(sample.name)) {
      result.push(sample)
    }
  })

  return result
}

async function run (files) {
  const selected = select(files)

  if (selected.length > 0) {
    console.log('Selected samples: (%d of %d)', selected.length, SAMPLES.length)
    selected.forEach(function (sample) {
      console.log(' > %s', sample.name)
    })
  } else {
    console.log('There isn\'t any sample matches any of these patterns: %s', util.inspect(files))
  }

  for (const sample of selected) {
    console.log('\n\nSample: %s %s', sample.filename, sample.title)

    IMPLS.forEach((impl) => {
      warmup(impl, sample.content.string)
    })

    for (const impl of IMPLS) {
      let stats, error

      try {
        stats = await measure(() => {
          doNotOptimize(impl.code.run(sample.content.string))
        }, BENCHMARK_OPTIONS)
      } catch (err) {
        error = err
      }

      console.log(' > %s', formatRun({ name: impl.name, stats, error }))
    }
  }
}

await run(process.argv.slice(2).map(function (source) {
  return new RegExp(source, 'i')
}))
