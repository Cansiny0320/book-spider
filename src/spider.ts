import axios, { AxiosResponse } from "axios"
import cheerio from "cheerio"
import fs from "fs"

import { DOWNLOAD_PATH, RETRY_TIMES, source } from "./config"
import { IBook, IContent, IContentUrl, IOptions, ISource } from "./interface"
import { checkFileExist, genSearchUrl, getSource, logger } from "./utils"

export class Spider {
  success: number
  fail: number
  total: number
  source!: ISource
  constructor(bookName: string, options?: IOptions) {
    if (options) {
      const { source } = options
      if (source) {
        this.source = source
      }
    }
    this.success = 0
    this.fail = 0
    this.total = 0
    this.run(bookName)
  }

  async getBookUrl(bookName: string) {
    const { Selector, Query } = this.source
    const res = await axios.get(genSearchUrl(Query, bookName))
    const $ = cheerio.load(res.data)
    let bookUrl = ($(Selector.SEARCH_RESULT).attr("href") as string).replace(this.source.Url, "")
    $(Selector.SEARCH_RESULT).each((_, ele) => {
      const title = $(ele).attr("title")
      if (title === bookName) {
        bookUrl = $(ele).attr("href") as string
      }
    })
    return bookUrl
  }

  async getBookInfo(bookUrl: string) {
    const { Selector } = this.source
    const contentUrls: IContentUrl[] = []
    const res = await axios.get(bookUrl)
    const $ = cheerio.load(res.data)
    const bookName = $(Selector.BOOK_NAME).text().trim()
    const author = $(Selector.BOOK_AUTHOR).text().trim().split(/:|：/).pop() as string
    const description = $(Selector.BOOK_DES).text().trim()
    $(Selector.CONTENT_URLS).each((_, ele) => {
      const url = (bookUrl + ($(ele).attr("href") as string).split("/").pop()) as string
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

  async retry(item: IContentUrl, times: number): Promise<AxiosResponse<any>> {
    try {
      const value = await axios.get(item.url)
      this.success++
      logger.success(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取成功`)
      return value
    } catch (err) {
      if (times > RETRY_TIMES) {
        this.fail++
        logger.fatal(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取失败`)
        return err
      }
      logger.fatal(`${item.title} 获取失败 第 ${times} 次重试...`)
      return this.retry(item, ++times)
    }
  }

  async getContent(contentUrls: IContentUrl[]) {
    const promises: Promise<AxiosResponse<any>>[] = []
    this.total = contentUrls.length
    contentUrls.forEach((item, index) => {
      logger.interactive.await(`[${index + 1}/${this.total}] - 正在获取: ${item.title}`)
      const promise = axios
        .get(item.url)
        .then(value => {
          this.success++
          logger.success(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取成功`)
          return value
        })
        .catch(() => {
          logger.fatal(`${item.title} 获取失败 第 1 次重试...`)
          return this.retry(item, 1)
        })
      promises.push(promise)
    })
    const res = await Promise.all(promises)
    if (this.fail > 0) {
      logger.fatal("有缺失章节 建议更换网络重试")
    }
    logger.success(`获取完成 成功：${this.success} 失败：${this.fail} 开始解析...`)

    return this.parseContent(res)
  }

  parseContent(res: AxiosResponse<any>[]) {
    const { Selector } = this.source
    const contents: IContent[] = []
    res.forEach(item => {
      if (item.data) {
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

  async writeFile(book: IBook) {
    const {
      contents,
      info: { author, description, bookName: raw },
    } = book
    const { AD } = this.source
    let suffix = 1
    let bookName = raw
    const write = () => {
      contents.forEach((item, index) => {
        if (index === 0) {
          logger.await(`正在写入：${bookName}...`)
          const info = `『${bookName}』\n『作者：${author}』\n『简介:${description}』\n`
          fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, info)
        }
        if (index === contents.length - 1) {
          logger.complete(`${bookName} 写入完成！`)
        }
        let content = `\n${item.title}\n${item.content}\n\n`
        AD.forEach(item => {
          content = content.replace(item, "")
        })
        fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, content)
      })
    }
    const suffixBookName = () => {
      bookName = `${raw}(${suffix})`
      suffix++
      checkFileExist(`${DOWNLOAD_PATH}/${bookName}.txt`, suffixBookName, write)
    }
    checkFileExist(`${DOWNLOAD_PATH}/${bookName}.txt`, suffixBookName, write)
  }

  async run(bookName: string) {
    try {
      if (!this.source) {
        this.source = await getSource(source)
      } else {
        logger.log(`爬取开始，本次指定书源：${this.source.Url}`)
      }
      axios.defaults.baseURL = this.source.Url
      const bookUrl = await this.getBookUrl(bookName)
      if (!bookUrl) {
        logger.fatal(`暂无${bookName}资源`)
        return
      }
      const { contentUrls, info } = await this.getBookInfo(bookUrl)
      fs.mkdirSync(DOWNLOAD_PATH, { recursive: true })
      const contents = await this.getContent(contentUrls)
      this.writeFile({ info, contents })
    } catch (error) {
      logger.fatal(error)
    }
  }
}
