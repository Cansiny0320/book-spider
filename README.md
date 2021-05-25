# 小说爬虫

🎉 开箱即用的高性能可配置小说爬虫 快速下载无广告 txt 文件

## ✨ 特性

📂 批量下载

🔄 章节获取失败重试

📑 美观的信息提示

⚡ 采用异步并发方式获取页面数据

🈚 去除书籍中的广告

🔧 可配置书籍来源网站

## 💡 使用方法

使用 NPM:

```bash
$ npm i

$ npm run spider [小说名]

# 或者下载 download.txt 文件中的小说

$ npm run spider download
```

使用 Yarn:

```bash
$ yarn or npm i

$ yarn spider [小说名]

# 或者下载 download.txt 文件中的小说

$ yarn spider download
```

## ❗ tips

支持批量下载 小说名之间用空格分开

下载的小说默认在 download 文件夹，也可以自己在 `config.ts` 配置

章节获取失败重试次数默认 3 次，可在 `config.ts` 配置

保证良好的网络可减少章节缺失率

**如何配置来源网站**

按照如下格式修改 `config.ts` 中的 `source` 数组

具体可以参考已配置的网站

```js
{
    Url: "", // 网站的根路径
    Selector: { // Selector 中的字段为 css 选择器
      SEARCH_RESULT: "", // 搜索页面的结果 a 标签
      BOOK_NAME: "", // 书籍名称
      BOOK_AUTHOR: "", // 书籍作者
      BOOK_DES: "", // 书籍介绍
      CONTENT_URLS: "", // 目录章节链接
      CONTENT_TITLE: "", // 章节标题
      BOOK_CONTENT: "", // 章节内容
    },
    AD: [], // 广告
    Query: {
      path: "", // 查询书籍的url
      param: "", // 查询书籍的参数
    },
  }
```

## 运行截图

![](https://cansiny.oss-cn-shanghai.aliyuncs.com/images/1621749960365-1621749953964.png)
