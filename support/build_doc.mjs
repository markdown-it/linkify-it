#!/usr/bin/env node

import { execFileSync } from 'child_process'
import { rmSync } from 'fs'

rmSync('demo/doc', { force: true, recursive: true })

const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()

const link_format = `https://github.com/{package.repository}/blob/${head}/{file}#L{line}`

execFileSync('node_modules/.bin/ndoc', ['--output', 'demo/doc', '--link-format', link_format], { stdio: 'inherit' })
