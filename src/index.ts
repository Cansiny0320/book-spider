import fs from 'fs'

import type { IOptions } from './interface'
import { Spider } from './spider'
import { getSpecSource } from './utils'

export const main = async (args: any) => {
  const bookNames: string[] = args.bookNames ?? []
  const url = args.source || args.s
  const limit = args.limit || args.l
  const inTurn = args.turn || args.t

  const options: IOptions = {
    limit: parseInt(limit) || 64,
    mode: inTurn ? 1 : 0,
  }

  if (url) {
    options.source = getSpecSource(url)
  }

  const spider = new Spider(options)

  if (args.download) {
    const download = fs.readFileSync('./download.txt', 'utf-8').split('\r\n')
    download.forEach(item => {
      spider.run(item)
    })
  } else {
    bookNames.forEach(item => {
      spider.run(item)
    })
  }
}
