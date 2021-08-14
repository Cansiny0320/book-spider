import fs from 'fs'
import { Signale } from 'signale'

import { sources } from './config'
import { IQuery } from './interface'

const interactive = new Signale({ interactive: true })

const signale = new Signale()

export const genSearchUrl = (query: IQuery, bookName: string) =>
  encodeURI(`${query.path}?${query.param}=${bookName}`)

export const getNowTime = () =>
  `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString(
    'chinese',
    {
      hour12: false,
    },
  )}`

export const logger = {
  success: (str: string) => signale.success(`${str} - ${getNowTime()}`),
  fatal: (str: string) => signale.fatal(`${str} - ${getNowTime()}`),
  log: (str: string) => signale.log(`${str} - ${getNowTime()}`),
  complete: (str: string) => signale.complete(`${str} - ${getNowTime()}`),
  await: (str: string) => signale.await(`${str} - ${getNowTime()}`),
  interactive,
}

export const getSpecSource = (url: string) =>
  sources.filter(v => v.Url === url)[0]

export const checkFileExist = (
  path: fs.PathLike,
  onExist: () => void,
  onNotExist: () => void,
) => {
  fs.access(path, fs.constants.F_OK, err => {
    if (err) {
      onNotExist()
    } else {
      onExist()
    }
  })
}

export const any = (values: Promise<any>[]) =>
  new Promise((resolve, reject) => {
    const length = values.length
    const errors: Promise<any>[] = []
    let resolved = false
    values.forEach(item =>
      Promise.resolve(item)
        .then(v => {
          if (!resolved) {
            resolved = true
            resolve(v)
          }
        })
        .catch(e => {
          errors.push(e)
          if (errors.length === length) {
            reject('无可用资源')
          }
        }),
    )
  })

export const sleep = (delay: number) =>
  new Promise(resolve => setTimeout(resolve, delay))
