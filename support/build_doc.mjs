#!/usr/bin/env node

import shell from 'shelljs'

shell.rm('-rf', 'doc')

const head = shell.exec('git show-ref --hash HEAD').stdout.slice(0, 6)

const link_format = `https://github.com/{package.repository}/blob/${head}/{file}#L{line}`

shell.exec(`node node_modules/.bin/ndoc --link-format "${link_format}"`)
