import fs from 'fs'
import optimist from 'optimist'

import { IOptions } from './interface'
import { Spider } from './spider'
import { getSpecSource } from './utils'

const argv = optimist.argv

const bookNames = argv._ as string[]
const url = argv.source as string
const limit = argv.limit as string
const mode = argv.mode as string

const options: IOptions = {
  limit: parseInt(limit) || 64,
  mode: parseInt(mode) || 0,
}

if (url) {
  options.source = getSpecSource(url)
}

const spider = new Spider(options)

if (bookNames[0] === 'download') {
  const download = fs.readFileSync('./download.txt', 'utf-8').split('\r\n')
  download.forEach(item => {
    spider.run(item)
  })
} else {
  bookNames.forEach(item => {
    spider.run(item)
  })
}
