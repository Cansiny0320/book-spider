import path from "path"

export const BASE_URL = "https://www.biquwx.la/"

export const DOWNLOAD_PATH = path.resolve(__dirname, "../download")

export enum Selector {
  SEARCH_RESULT = "td > a",
  BOOK_NAME = "#info h1",
  BOOK_AUTHOR = "#info h1+p",
  BOOK_DES = "#intro",
  CONTENT_URLS = ".box_con dd a",
  CONTENT_TITLE = ".bookname h1",
  BOOK_CONTENT = "#content",
}

export const AD = [
  "看最快更新无错小说，请记住 https://www.biquge.com.cn！章节内容正在手打中，请稍等片刻，内容更新后，请重新刷新页面，即可获取最新更新！",
  "[笔趣阁 www.biqugetv.info]",
]

export const RETRY_TIMES = 3
