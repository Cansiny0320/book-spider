export interface IContent {
  title: string
  content: string
}

export interface IContentUrl {
  url: string
  title: string
}

export interface IBookInfo {
  author: string
  bookName: string
  description: string
}

export interface IBook {
  contents: IContent[]
  info: IBookInfo
}

export interface IQuery {
  path: string
  param: string
}

export interface ISource {
  Selector: ISelector
  Url: string
  AD: string[]
  Query: IQuery
}

export interface ISelector {
  SEARCH_RESULT: string
  BOOK_NAME: string
  BOOK_AUTHOR: string
  BOOK_DES: string
  CONTENT_URLS: string
  CONTENT_TITLE: string
  BOOK_CONTENT: string
}

export interface IOptions {
  source?: ISource
  limit: number
  mode?: number
}

export interface IResultGetBookUrl {
  source: ISource
  bookUrl: string
}
