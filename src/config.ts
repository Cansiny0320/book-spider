import path from "path"

export const BASE_URL = "https://www.biquge.com.cn"

export const DOWNLOAD_PATH = path.resolve(__dirname, "../download")

export enum Selector {
  SEARCH_RESULT = ".result-game-item-title-link",
  CONTENT_URLS = ".box_con dd a",
  BOOK_TITLE = ".bookname h1",
  BOOK_CONTENT = "#content",
}
