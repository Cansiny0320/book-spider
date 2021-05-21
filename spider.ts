import fs from "fs"
import axios, { AxiosResponse } from "axios"
import cheerio from "cheerio"
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
  $(".box_con dd a").each((index, ele) => {
    const url = $(ele).attr("href")
    contentUrls.push(url as string)
  })
  return contentUrls
}

async function getContent(contentUrls: string[]) {
  const promises: Promise<AxiosResponse<any>>[] = []
  const contents: IContent[] = []
  contentUrls.forEach((item, index) => {
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
    const book = `${item.title}${item.content}\n\n`
    fs.writeFile(`./download/${bookName}.txt`, book, { flag: "a" }, err => {
      if (err) console.log(err)
    })
  })
}

async function spider() {
  const name = process.argv.slice(2)[0]
  const bookUrl = await getBookUrl(name)
  const contentUrls = await getContentUrls(bookUrl)
  fs.mkdir("./download", { recursive: true }, err => {
    if (err) console.log(err)
  })
  writeFile(name, await getContent(contentUrls))
}

spider()
