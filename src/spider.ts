import axios, { AxiosResponse } from "axios"
import cheerio from "cheerio"
import fs from "fs"

import { BASE_URL, DOWNLOAD_PATH, Selector } from "./config"
import { genSearchUrl } from "./utils"

axios.defaults.baseURL = BASE_URL

interface IContent {
  title: string
  content: string
}

async function getBookUrl(bookName: string) {
  const res = await axios.get(genSearchUrl(bookName))
  const $ = cheerio.load(res.data)
  return $(Selector.SEARCH_RESULT).attr("href") as string
}

async function getContentUrls(bookUrl: string) {
  const contentUrls: string[] = []
  const res = await axios.get(bookUrl)
  const $ = cheerio.load(res.data)
  $(Selector.CONTENT_URLS).each((_, ele) => {
    const url = $(ele).attr("href")
    contentUrls.push(url as string)
  })
  return contentUrls
}

async function getContent(contentUrls: string[]) {
  const promises: Promise<AxiosResponse<any>>[] = []
  const contents: IContent[] = []
  contentUrls.forEach(item => {
    promises.push(axios.get(item))
  })
  const res = await Promise.all(promises)
  res.forEach((item, index) => {
    const $ = cheerio.load(item.data)
    const title = $(Selector.BOOK_TITLE).text()
    const content = $(Selector.BOOK_CONTENT).text().replace(/    /g, "\n\n") // 空格换为空行
    console.log(`正在下载: ${title} ${index + 1} / ${res.length}`)
    contents.push({
      title,
      content,
    })
  })
  return contents
}

async function writeFile(bookName: string, contents: IContent[]) {
  contents.forEach((item, index) => {
    if (index === 0) {
      console.log("写入中...")
    }
    if (index === contents.length - 1) {
      console.log("写入完成！")
    }
    const book = `\n${item.title}\n${item.content}\n\n`
    fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, book)
  })
}

async function spider() {
  try {
    const name = process.argv.slice(2)[0]
    const bookUrl = await getBookUrl(name)
    if (!bookUrl) {
      console.log("暂无书籍资源")
      return
    }
    const contentUrls = await getContentUrls(bookUrl)
    fs.mkdirSync(DOWNLOAD_PATH, { recursive: true })
    writeFile(name, await getContent(contentUrls))
  } catch (error) {
    console.log(error)
  }
}

spider()
