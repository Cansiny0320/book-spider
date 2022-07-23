import axios, { AxiosResponse } from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import iconv from 'iconv-lite'
import { limit, retry } from '@cansiny0320/async-extra'
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

  async getBookUrl(bookName: string, source: ISource): Promise<IResultGetBookUrl> {
    const { Selector, Query } = source
    const { data } = await axios.get(genSearchUrl(Query, bookName), {
      baseURL: Query.domain || this.source?.Url!,
    })
    const $ = cheerio.load(data)

    let bookUrl = ''

    $(Selector.SEARCH_RESULT).each((_, ele) => {
      const title = $(ele).text()
      const href = $(ele).attr('href')

      if (title === bookName && href) {
        bookUrl = href.replace(source.Url, '')
      }
    })

    return new Promise((resolve, reject) => {
      if (!bookUrl) {
        reject('没有找到相关书籍')
      }
      resolve({ source, bookUrl })
    })
  }

  async getBookInfo(bookUrl: string) {
    const { Selector } = this.source!
    const contentUrls: IContentUrl[] = []
    const res = await axios
      .get(bookUrl, {
        timeout: 5000,
        responseType: 'arraybuffer',
      })
      .then(res => {
        if (res.headers['content-type'].includes('gb2312')) {
          const decodeData = iconv.decode(res.data, 'gbk')
          res.data = decodeData
        }
        return res
      })
    const $ = cheerio.load(res.data)
    const bookName = $(Selector.BOOK_NAME).text().trim()
    const author = $(Selector.BOOK_AUTHOR).text().trim().split(/[:：]/).pop() as string
    const description = $(Selector.BOOK_DES).text().trim()
    $(Selector.CONTENT_URLS).each((_, ele) => {
      const href = $(ele).attr('href')!
      const url = href.startsWith('/') ? href : `${bookUrl}${href}`
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

  async fetchDetail(item: IContentUrl): Promise<string> {
    try {
      const { data } = await retry(
        () =>
          axios
            .get(item.url, {
              timeout: 10000,
              responseType: 'arraybuffer',
            })
            .then(function (res) {
              if (res.headers['content-type'].includes('gb2312')) {
                const decodeData = iconv.decode(res.data, 'gbk')
                res.data = decodeData
              }
              return res
            }),
        RETRY_TIMES,
        {
          onRetry: times => {
            logger.fatal(`${item.title} 获取失败 第 ${times} 次重试...`)
          },
        },
      )
      this.success++
      logger.success(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取成功`)
      return data
    } catch (error) {
      this.fail++
      logger.fatal(`[${this.success + this.fail}/${this.total}] - ${item.title} 获取失败`)
      return JSON.stringify(error)
    }
  }

  async getContent(contentUrls: IContentUrl[]) {
    this.total = contentUrls.length
    const res = (await limit(
      contentUrls.map(item => () => this.fetchDetail(item)),
      this.limit,
    )) as AxiosResponse<any, any>[]
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
        const data = await this.fetchDetail(item)
        const { title, content } = this.getDetail(data, Selector)
        const rawContent = `${title}${content}\n\n`
        let section = this.removeAd(rawContent, AD)
        fs.appendFileSync(`${DOWNLOAD_PATH}/${bookName}.txt`, section)
      }
    }

    const writeNewFile = async () => {
      const info = `『${bookName}』\n『作者：${author}』\n『简介:${description}』\n\n`
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
      if (item) {
        const { title, content } = this.getDetail(item, Selector)
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
      .replace(/\n/g, '')
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
    const URLRegex = /(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gm
    content = content.replace(URLRegex, '')
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
        let content = `\n${item.title}\n${item.content}`
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
    const requests: Promise<IResultGetBookUrl>[] = []
    sources.forEach(source => {
      axios.defaults.baseURL = source.Url
      requests.push(this.getBookUrl(bookName, source))
    })
    return Promise.any(requests)
  }

  async run(bookName: string) {
    try {
      if (!this.source) {
        try {
          const { bookUrl, source } = await this.selectSource(bookName)
          this.bookUrl = bookUrl
          this.source = source
          axios.defaults.baseURL = this.source.Url
          logger.log(`爬取开始，已自动选择最快书源：${source.Url}`)
        } catch (error) {
          logger.fatal(`${bookName} 没有找到！`)
          return
        }
      } else {
        axios.defaults.baseURL = this.source.Url
        const result = await this.getBookUrl(bookName, this.source)
        const { bookUrl } = result
        if (!bookUrl) {
          logger.fatal(`${bookName} 没有找到！`)
          return
        }
        if (bookUrl) {
          this.bookUrl = bookUrl
          logger.log(`爬取开始，本次指定书源：${this.source.Url}`)
        }
      }
      const { contentUrls, info } = await this.getBookInfo(this.bookUrl!)
      logger.success(`获取书籍信息成功`)
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
