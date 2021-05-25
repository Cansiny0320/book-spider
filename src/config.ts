import path from "path"

import { ISource } from "./interface"

export const DOWNLOAD_PATH = path.resolve(__dirname, "../download")

export const source: ISource[] = [
  {
    Url: "https://www.biquwx.la",
    Selector: {
      SEARCH_RESULT: "td > a",
      BOOK_NAME: "#info h1",
      BOOK_AUTHOR: "#info h1+p",
      BOOK_DES: "#intro",
      CONTENT_URLS: ".box_con dd a",
      CONTENT_TITLE: ".bookname h1",
      BOOK_CONTENT: "#content",
    },
    AD: [
      '温馨提示：笔趣阁已启用新域名"biquge.info"，原域名即将停止使用。请相互转告，谢谢！',
      "[ biquge.xyz]",
      "笔、趣、阁www。biquge。info",
    ],
    Query: {
      path: "/modules/article/search.php",
      param: "searchkey",
    },
  },
  {
    Url: "https://www.biquge.com.cn",
    Selector: {
      SEARCH_RESULT: ".result-game-item-title-link",
      BOOK_NAME: "#info h1",
      BOOK_AUTHOR: "#info h1+p",
      BOOK_DES: "#intro",
      CONTENT_URLS: ".box_con dd a",
      CONTENT_TITLE: ".bookname h1",
      BOOK_CONTENT: "#content",
    },
    AD: [
      "看最快更新无错小说，请记住 https://www.biquge.com.cn！章节内容正在手打中，请稍等片刻，内容更新后，请重新刷新页面，即可获取最新更新！",
      "[笔趣阁 www.biqugetv.info]",
    ],
    Query: {
      path: "/search.php",
      param: "q",
    },
  },
  {
    Url: "https://www.xbiquge.la",
    Selector: {
      SEARCH_RESULT: ".even a",
      BOOK_NAME: "#info h1",
      BOOK_AUTHOR: "#info h1+p",
      BOOK_DES: "#intro p:last-child",
      CONTENT_URLS: ".box_con dd a",
      CONTENT_TITLE: ".bookname h1",
      BOOK_CONTENT: "#content",
    },
    AD: [
      "亲,点击进去,给个好评呗,分数越高更新越快,据说给新笔趣阁打满分的最后都找到了漂亮的老婆哦!手机站全新改版升级地址：https://m.xbiquge.la，数据和书签与电脑站同步，无广告清新阅读！",
    ],
    Query: {
      path: "/modules/article/waps.php",
      param: "searchkey",
    },
  },
]

export const RETRY_TIMES = 3
