import path from "path"

export const BASE_URL = "https://www.biquge.com.cn"

export const DOWNLOAD_PATH = path.resolve(__dirname, "../download")

export enum Selector {
  SEARCH_RESULT = ".result-game-item-title-link",
  BOOK_NAME = "#info h1",
  BOOK_AUTHOR = "#info h1+p",
  BOOK_DES = "#intro",
  CONTENT_URLS = ".box_con dd a",
  CONTENT_TITLE = ".bookname h1",
  BOOK_CONTENT = "#content",
}
