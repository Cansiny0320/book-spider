import fs from 'fs'
import _Signale from 'signale'

import { sources } from './config'
import { IQuery } from './interface'

const { Signale } = _Signale

const interactive = new Signale({ interactive: true })

const signale = new Signale()

export const genSearchUrl = (query: IQuery, bookName: string) => {
  const { path, param, restParams } = query
  const _params = {
    [param]: bookName,
    ...restParams,
  }
  const paramsString = Object.entries(_params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return encodeURI(`${path}?${paramsString}`)
}

export const getNowTime = () =>
  `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('chinese', {
    hour12: false,
  })}`

export const logger = {
  success: (str: string) => signale.success(`${str} - ${getNowTime()}`),
  fatal: (str: string) => signale.fatal(`${str} - ${getNowTime()}`),
  log: (str: string) => signale.log(`${str} - ${getNowTime()}`),
  complete: (str: string) => signale.complete(`${str} - ${getNowTime()}`),
  await: (str: string) => signale.await(`${str} - ${getNowTime()}`),
  interactive,
}

export const getSpecSource = (url: string) => sources.find(v => v.Url === url)

export const checkFileExist = (path: fs.PathLike, onExist: () => void, onNotExist: () => void) => {
  fs.access(path, fs.constants.F_OK, err => {
    if (err) {
      onNotExist()
    } else {
      onExist()
    }
  })
}

export const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay))
