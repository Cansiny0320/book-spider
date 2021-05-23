import { Signale } from "signale"

const interactive = new Signale({ interactive: true })

const signale = new Signale()

export const genSearchUrl = (bookName: string) =>
  encodeURI(`/modules/article/search.php?searchkey=${bookName}`)

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
