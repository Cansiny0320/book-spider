import { Signale } from "signale"
import axios from "axios"
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

export const checkSource = async (source: string) => {
  try {
    await axios.get(source)
    return true
  } catch (error) {
    return false
  }
}

export const getSource = async (source: ISource[]) => {
  for (let i = 0; i < source.length; i++) {
    try {
      if (await checkSource(source[i].Url)) {
        return source[i]
      }
    } catch (error) {
      logger.fatal(`${source[i].Url} 暂不可用，检查下一个网站...`)
    }
  }
  throw new Error(`无可用网站！`)
}
