export const genSearchUrl = (bookName: string) => encodeURI(`/search.php?q=${bookName}`)

export const getNowTime = () =>
  `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString("chinese", {
    hour12: false,
  })}`

export const log = (str: string) => console.log(`${str} - ${getNowTime()}`)
