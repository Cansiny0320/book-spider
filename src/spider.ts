import axios, { AxiosResponse } from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import { DOWNLOAD_PATH, RETRY_TIMES, sources } from './config'
import {
  IBook,
  IBookInfo,
  IContent,
  IContentUrl,
  IOptions,
  IResultGetBookUrl,
  ISelector,
  ISource,
} from './interface'
import { checkFileExist, genSearchUrl, logger, sleep } from './utils'

export class Spider {
  success: number
  fail: number
  total: number
  source: ISource | undefined
  bookUrl: string | undefined
  limit: number
  mode: number
  constructor(options: IOptions) {
    this.success = 0
    this.fail = 0
    this.total = 0
    this.source = options.source
    this.limit = options.limit
    this.mode = options.mode || 0
  }

  async getBookUrl(bookName: string, source: ISource) {
    const { Selector, Query } = source
    const res = await axios.get(genSearchUrl(Query, bookName))
    const $ = cheerio.load(res.data)
    let bookUrl = ($(Selector.SEARCH_RESULT).attr('href') as string).replace(source.Url, '')
    $(Selector.SEARCH_RESULT).each((_, ele) => {
      const title = $(ele).attr('title')
      if (title === bookName) {
        bookUrl = ($(ele).attr('href') as string).replace(source.Url, '')
      }
    })
    if (bookUrl) return { source, bookUrl }
  }

  async getBookInfo(bookUrl: string) {
    const { Selector } = this.source!
    const contentUrls: IContentUrl[] = []
    const res = await axios.get(bookUrl)
    const $ = cheerio.load(res.data)
    const bookName = $(Selector.BOOK_NAME).text().trim()
    const author = $(Selector.BOOK_AUTHOR).text().trim().split(/[:：]/).pop() as string
    const description = $(Selector.BOOK_DES).text().trim()
    $(Selector.CONTENT_URLS).each((_, ele) => {
      const url = bookUrl + ($(ele).attr('href') as string).split('/').pop()
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

  async limitRequest(limit: number, array: IContentUrl[]) {
    const res: Promise<any>[] = [] // 存储所有的异步任务
    const executing: Promise<any>[] = [] // 存储正在执行的异步任务
    for (const item of array) {
      const p = Promise.resolve().then(() =>
        axios
          .get(item.url)
          .then(value => {
            this.success++
            logger.success(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取成功`)
            return value
          })
          .catch(() => {
            logger.fatal(`${item.title} 获取失败 第 1 次重试...`)
            return this.retry(item)
          }),
      )
      res.push(p) // 保存新的异步任务
      // 当limit值小于或等于总任务个数时，进行并发控制
      if (limit <= array.length) {
        // 当任务完成后，从正在执行的任务数组中移除已完成的任务
        const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1))
        executing.push(e) // 保存正在执行的异步任务
        if (executing.length >= limit) {
          await Promise.race(executing) // 等待较快的任务执行完成
        }
      }
    }
    return Promise.all(res)
  }

  async retry(item: IContentUrl, times: number = 1): Promise<AxiosResponse> {
    try {
      const value = await axios.get(item.url)
      this.success++
      logger.success(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取成功`)
      return value
    } catch (err) {
      if (times > RETRY_TIMES) {
        this.fail++
        logger.fatal(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取失败`)
        return err as Promise<AxiosResponse>
      }
      logger.fatal(`${item.title} 获取失败 第 ${times} 次重试...`)
      await sleep(1000)
      return this.retry(item, ++times)
    }
  }

  async getContent(contentUrls: IContentUrl[]) {
    this.total = contentUrls.length
    const res = await this.limitRequest(this.limit, contentUrls)
    if (this.fail > 0) {
      logger.fatal('有缺失章节 建议更换网络重试')
    }
    logger.success(`获取完成 成功：${this.success} 失败：${this.fail} 开始解析...`)

    return this.parseContent(res)
  }

  async downloadInTurn(contentUrls: IContentUrl[], info: IBookInfo) {
    const { Selector, AD } = this.source!
    const { bookName, author, description } = info

    const writeInTurn = async (start: number = 0) => {
      const _contentUrls = contentUrls.slice(start)
      this.total = _contentUrls.length
      for (const item of _contentUrls) {
        const { data } = await this.retry(item)
        const { title, content } = this.getDetail(data, Selector)
        let section = this.removeAd(`\n${title}\n${content}\n\n`, AD)
        fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, section)
      }
    }

    const writeNewFile = async () => {
      const info = `『${bookName}』\n『作者：${author}』\n『简介:${description}』\n`
      fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, info)
      writeInTurn()
    }
    const appendFile = async () => {
      const fileContent = fs.readFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, 'utf8')
      let start = 0
      contentUrls.some((item, index) => {
        if (!fileContent.includes(item.title)) {
          start = index
          return true
        }
      })
      writeInTurn(start)
    }
    checkFileExist(`${DOWNLOAD_PATH}/${bookName}.txt`, appendFile, writeNewFile)
  }

  parseContent(res: AxiosResponse[]) {
    const { Selector } = this.source!
    const contents: IContent[] = []
    res.forEach(item => {
      if (item.data) {
        const { title, content } = this.getDetail(item.data, Selector)
        contents.push({
          title,
          content,
        })
      }
    })
    return contents
  }

  getDetail(data: any, Selector: ISelector) {
    const $ = cheerio.load(data)
    const title = $(Selector.CONTENT_TITLE).text()
    const content = $(Selector.BOOK_CONTENT)
      .text()
      .replace(/    |　　/g, '\n\n') // 空格换为空行
    return {
      title,
      content,
    }
  }

  removeAd(content: string, AD: string[]) {
    AD.forEach(e => {
      content = content.replace(e, '')
    })
    const URLRegex = /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/g
    content = content.replace(URLRegex, '')
    content = content.includes(this.source!.Url) ? '' : content
    return content
  }

  async writeFile(book: IBook) {
    const {
      contents,
      info: { author, description, bookName: raw },
    } = book
    const { AD } = this.source!
    let suffix = 1
    let bookName = raw
    const write = () => {
      contents.forEach((item, index) => {
        if (index === 0) {
          logger.await(`正在写入：${raw}...`)
          const info = `『${raw}』\n『作者：${author}』\n『简介:${description}』\n`
          fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, info)
        }
        if (index === contents.length - 1) {
          logger.complete(`${bookName} 写入完成！`)
        }
        let content = `\n${item.title}\n${item.content}\n\n`
        content = this.removeAd(content, AD)
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

  async selectSource(bookName: string) {
    const requests: Promise<IResultGetBookUrl | undefined>[] = []
    sources.forEach(source => {
      axios.defaults.baseURL = source.Url
      requests.push(this.getBookUrl(bookName, source))
    })
    return (await Promise.any(requests)) as unknown as Promise<IResultGetBookUrl>
  }

  async run(bookName: string) {
    try {
      if (!this.source) {
        const { bookUrl, source } = await this.selectSource(bookName)
        this.bookUrl = bookUrl
        this.source = source
        axios.defaults.baseURL = this.source.Url
        logger.log(`爬取开始，已自动选择最快书源：${source.Url}`)
      } else {
        axios.defaults.baseURL = this.source.Url
        const result = await this.getBookUrl(bookName, this.source)
        if (result) {
          const { bookUrl } = result
          this.bookUrl = bookUrl
          logger.log(`爬取开始，本次指定书源：${this.source.Url}`)
        }
      }
      const { contentUrls, info } = await this.getBookInfo(this.bookUrl!)
      fs.mkdirSync(DOWNLOAD_PATH, { recursive: true })
      if (this.mode === 1) {
        await this.downloadInTurn(contentUrls, info)
        return
      }
      const contents = await this.getContent(contentUrls)
      await this.writeFile({ info, contents })
    } catch (error) {
      logger.fatal(error as string)
    }
  }
}
