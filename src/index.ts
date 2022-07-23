import fs from 'fs'
import mri from 'mri'

import { IOptions } from './interface'
import { Spider } from './spider'
import { getSpecSource } from './utils'

const args = mri(process.argv.splice(2))

const bookNames = args._
const url = args.source
const limit = args.limit
const mode = args.mode

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
