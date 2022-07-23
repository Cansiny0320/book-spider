import fs from 'fs'
import mri from 'mri'

import { IOptions } from './interface'
import { Spider } from './spider'
import { getSpecSource } from './utils'

const args = mri(process.argv.splice(2))

const bookNames = args._
const url = args.source || args.s
const limit = args.limit || args.l
const inTurn = args.t

const options: IOptions = {
  limit: parseInt(limit) || 64,
  mode: inTurn ? 1 : 0,
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
