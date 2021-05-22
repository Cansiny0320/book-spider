import axios, { AxiosResponse } from "axios"
import cheerio from "cheerio"
import fs from "fs"

import { BASE_URL, DOWNLOAD_PATH, Selector } from "./config"
import { IBook, IContent, IContentUrl } from "./interface"
import { genSearchUrl, getNowTime } from "./utils"

axios.defaults.baseURL = BASE_URL

async function getBookUrl(bookName: string) {
  const res = await axios.get(genSearchUrl(bookName))
  const $ = cheerio.load(res.data)
  let bookUrl = $(Selector.SEARCH_RESULT).attr("href") as string
  $(Selector.SEARCH_RESULT).each((_, ele) => {
    const title = $(ele).attr("title")
    if (title === bookName) {
      bookUrl = $(ele).attr("href") as string
    }
  })
  return bookUrl
}

async function getBookInfo(bookUrl: string) {
  const contentUrls: IContentUrl[] = []
  const res = await axios.get(bookUrl)
  const $ = cheerio.load(res.data)
  const bookName = $(Selector.BOOK_NAME).text().trim()
  const author = $(Selector.BOOK_AUTHOR).text().trim().split("：")[1]
  const description = $(Selector.BOOK_DES).text().trim()
  $(Selector.CONTENT_URLS).each((_, ele) => {
    const url = $(ele).attr("href") as string
    const title = $(ele).text()
    contentUrls.push({ url, title })
  })
  return {
    contentUrls,
    info: {
      bookName,
      author,
      description,
    },
  }
}

async function getContent(contentUrls: IContentUrl[]) {
  const promises: Promise<AxiosResponse<any>>[] = []
  const contents: IContent[] = []
  contentUrls.forEach((item, index) => {
    console.log(`正在获取: ${item.title} ${index + 1} / ${contentUrls.length} - ${getNowTime()}`)
    const promise = axios
      .get(item.url)
      .then(value => {
        console.log(`${item.title} 获取成功 - ${getNowTime()}`)
        return value
      })
      .catch(() => {
        console.log(`${item.title} 获取失败 - ${getNowTime()}`)
        return Promise.reject("")
      })
    promises.push(promise)
  })
  const res = await Promise.all(promises)
  console.log(`获取完成 开始解析 - ${getNowTime()}`)

  res.forEach(item => {
    if (item) {
      const $ = cheerio.load(item.data)
      const title = $(Selector.CONTENT_TITLE).text()
      const content = $(Selector.BOOK_CONTENT)
        .text()
        .replace(/    |　　/g, "\n\n") // 空格换为空行
      contents.push({
        title,
        content,
      })
    }
  })
  return contents
}

async function writeFile(book: IBook) {
  const {
    contents,
    info: { author, description, bookName },
  } = book
  contents.forEach((item, index) => {
    if (index === 0) {
      console.log(`正在写入：${bookName}... - ${getNowTime()}`)
      const info = `『${bookName}』\n『作者：${author}』\n『简介:${description}』\n`
      fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, info)
    }
    if (index === contents.length - 1) {
      console.log(`${bookName} 写入完成！- ${getNowTime()}`)
    }
    const book = `\n${item.title}\n${item.content}\n\n`
    fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, book)
  })
}

const args = process.argv.slice(2)

async function spider(bookName: string) {
  try {
    const bookUrl = await getBookUrl(bookName)
    if (!bookUrl) {
      console.log(`暂无${bookName}资源`)
      return
    }
    const { contentUrls, info } = await getBookInfo(bookUrl)
    fs.mkdirSync(DOWNLOAD_PATH, { recursive: true })
    const contents = await getContent(contentUrls)
    writeFile({ info, contents })
  } catch (error) {
    console.log(error)
  }
}

args.forEach(item => {
  spider(item)
})
