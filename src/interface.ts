export interface IContent {
  title: string
  content: string
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
