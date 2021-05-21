import axios, { AxiosResponse } from "axios"
import cheerio from "cheerio"
import fs from "fs"

const baseUrl = "https://www.biquge.com.cn"
axios.defaults.baseURL = baseUrl

interface IContent {
  title: string
  content: string
}
async function getBookUrl(bookName: string) {
  const res = await axios.get(encodeURI(`/search.php?q=${bookName}`))
  const $ = cheerio.load(res.data)
  return $(".result-game-item-title-link").attr("href") as string
}

async function getContentUrls(bookUrl: string) {
  const contentUrls: string[] = []
  const res = await axios.get(bookUrl)
  const $ = cheerio.load(res.data)
  $(".box_con dd a").each((_, ele) => {
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
    const title = $(".bookname h1").text()
    const content = $("#content").text().replace(/    /g, "\n\n")
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
    fs.appendFileSync(`./download/${bookName}.txt`, book)
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
    fs.mkdirSync("./download", { recursive: true })
    writeFile(name, await getContent(contentUrls))
  } catch (error) {
    console.log(error)
  }
}

spider()
