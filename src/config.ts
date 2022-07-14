import path from 'path'

import { ISource } from './interface'

export const DOWNLOAD_PATH = path.resolve(process.cwd(), './download')

export const sources: ISource[] = [
  {
    Url: 'https://www.biquge.com.cn',
    Selector: {
      SEARCH_RESULT: '.result-game-item-title-link',
      BOOK_NAME: '#info h1',
      BOOK_AUTHOR: '#info h1+p',
      BOOK_DES: '#intro',
      CONTENT_URLS: '.box_con dd a',
      CONTENT_TITLE: '.bookname h1',
      BOOK_CONTENT: '#content',
    },
    AD: [
      '看最快更新无错小说，请记住 https://www.biquge.com.cn！章节内容正在手打中，请稍等片刻，内容更新后，请重新刷新页面，即可获取最新更新！',
      '[笔趣阁 www.biqugetv.info]',
    ],
    Query: {
      path: '/search.php',
      param: 'q',
    },
  },
  {
    Url: 'https://www.xbiquge.la',
    Selector: {
      SEARCH_RESULT: '.even a',
      BOOK_NAME: '#info h1',
      BOOK_AUTHOR: '#info h1+p',
      BOOK_DES: '#intro p:last-child',
      CONTENT_URLS: '.box_con dd a',
      CONTENT_TITLE: '.bookname h1',
      BOOK_CONTENT: '#content',
    },
    AD: [
      '亲,点击进去,给个好评呗,分数越高更新越快,据说给新笔趣阁打满分的最后都找到了漂亮的老婆哦!手机站全新改版升级地址：https://m.xbiquge.la，数据和书签与电脑站同步，无广告清新阅读！',
    ],
    Query: {
      path: '/modules/article/waps.php',
      param: 'searchkey',
    },
  },
  {
    Url: 'https://www.xbiquwx.la',
    Selector: {
      SEARCH_RESULT: 'td > a',
      BOOK_NAME: '#info h1',
      BOOK_AUTHOR: '#info h1+p',
      BOOK_DES: '#intro',
      CONTENT_URLS: '.box_con dd a',
      CONTENT_TITLE: '.bookname h1',
      BOOK_CONTENT: '#content',
    },
    AD: [
      '温馨提示：笔趣阁已启用新域名"biquge.info"，原域名即将停止使用。请相互转告，谢谢！',
      '[ biquge.xyz]',
      '笔、趣、阁www。biquge。info',
    ],
    Query: {
      path: '/modules/article/search.php',
      param: 'searchkey',
    },
  },
  {
    Url: 'https://www.qu-la.com',
    Selector: {
      SEARCH_RESULT: '.s2 a',
      BOOK_NAME: '#list > div.book-main > div.book-text > h1',
      BOOK_AUTHOR: '#list > div.book-main > div.book-text > span',
      BOOK_DES: '.intro',
      CONTENT_URLS: '.cf:nth-child(4) a',
      CONTENT_TITLE: '.chaptername',
      BOOK_CONTENT: '#txt',
    },
    AD: [],
    Query: {
      domain: 'https://so.biqusoso.com',
      path: '/s.php',
      param: 'q',
      restParams: {
        ie: 'utf-8',
      },
    },
  },
  {
    Url: 'https://www.shuquge.com',
    Selector: {
      SEARCH_RESULT: '.bookinfo .bookname a',
      BOOK_NAME: '.info > h2',
      BOOK_AUTHOR: '.info > .small > span:first-child',
      BOOK_DES: '.info > .intro',
      CONTENT_URLS: '.listmain dl dt:nth-child(2n)~dd a',
      CONTENT_TITLE: '.content h1',
      BOOK_CONTENT: '#content',
    },
    AD: ['请记住本书首发域名：www.shuquge.com。书趣阁_笔趣阁手机版阅读网址：wap.shuquge.com'],
    Query: {
      path: '/search.php',
      param: 'searchkey',
    },
  },
  // {
  //   Url: 'https://www.biqugeabc.com',
  //   Selector: {
  //     SEARCH_RESULT: 'span >a',
  //     BOOK_NAME: '.top h1',
  //     BOOK_AUTHOR: '.fix > p:first-child',
  //     BOOK_DES: '.desc',
  //     CONTENT_URLS: '#chapter_list li a',
  //     CONTENT_TITLE: '.title',
  //     BOOK_CONTENT: '.text_row_txt',
  //   },
  //   AD: [
  //     '不想错过《异世界：我的人生开了挂！》更新？安装笔趣阁专用APP，作者更新立即推送！承诺永久免费！',
  //     '章节错误,点此举报(免注册),举报后维护人员会在两分钟内校正章节内容,请耐心等待,并刷新页面。',
  //     '下载最新破解vip章节的笔趣阁APP，全站免费看，这种宝藏APP手慢就找不到下载地址啦！>>戳这里下载安装<<',
  //   ],
  //   Query: {
  //     path: 'search.html',
  //     param: 'key',
  //   },
  // },
]

export const RETRY_TIMES = 3
