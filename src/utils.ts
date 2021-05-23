import chalk from "chalk"

export const genSearchUrl = (bookName: string) => encodeURI(`/search.php?q=${bookName}`)

export const getNowTime = () =>
  `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString("chinese", {
    hour12: false,
  })}`

export const logger = {
  success: (str: string) => console.log(chalk.green(`${str} - ${getNowTime()}`)),
  fail: (str: string) => console.log(chalk.red(`${str} - ${getNowTime()}`)),
  log: (str: string) => console.log(`${str} - ${getNowTime()}`),
}
