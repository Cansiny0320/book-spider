import axios from "axios"
import fs from "fs"
import { Signale } from "signale"

import { IQuery, ISource } from "./interface"

const interactive = new Signale({ interactive: true })

const signale = new Signale()

export const genSearchUrl = (query: IQuery, bookName: string) =>
  encodeURI(`${query.path}?${query.param}=${bookName}`)

export const getNowTime = () =>
  `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString("chinese", {
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

export const getSource = async (source: ISource[]) => {
  const requests = []
  for (let i = 0; i < source.length; i++) {
    requests.push(
      axios.get(source[i].Url).then(() => {
        return Promise.resolve(i)
      }),
    )
  }
  try {
    const result = await any(requests)
    logger.log(`爬取开始，已自动选择最快书源：${source[result as number].Url}`)
    return source[result as number]
  } catch (error) {
    throw new Error(`无可用网站或网络异常`)
  }
}

export const checkFileExist = (path: fs.PathLike, onExist: () => void, onNotExist: () => void) => {
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
    values.map(item =>
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
            reject(new AggregateError(errors, "No Promise in Promise.any was resolved"))
          }
        }),
    )
  })
