![book-spider](https://socialify.git.ci/Cansiny0320/book-spider/image?description=1&descriptionEditable=%F0%9F%8E%89%20%E5%BC%80%E7%AE%B1%E5%8D%B3%E7%94%A8%E7%9A%84%E9%AB%98%E6%80%A7%E8%83%BD%E5%8F%AF%E8%87%AA%E5%AE%9A%E4%B9%89%E7%9A%84%E7%AC%94%E8%B6%A3%E9%98%81%E5%B0%8F%E8%AF%B4%E7%88%AC%E8%99%AB%20%20%E5%BF%AB%E9%80%9F%E4%B8%8B%E8%BD%BD%E6%97%A0%E5%B9%BF%E5%91%8A%E5%B0%8F%E8%AF%B4&font=Inter&language=1&owner=1&pattern=Plus&stargazers=1&theme=Light)

## ✨ 特性

📂 批量下载

🔄 章节获取失败重试

▶️ 可自由配置的并发控制

📑 美观的信息提示

⚡ 采用异步并发方式获取页面数据

🈚 去除书籍中的广告

🔧 可配置书籍来源网站

## 💡 使用方法

> 需要 Node 版本 >= 15.0.0

使用 NPM:

```bash
$ npm i

$ npm run spider [小说名]

# 或者下载 download.txt 文件中的小说

$ npm run spider download
```

使用 Yarn:

```bash
$ yarn

$ yarn spider [小说名]

# 或者下载 download.txt 文件中的小说

$ yarn spider download
```

默认会自动选择最快书源，若要指定书源

```bash

$ yarn spider --source [url] [小说名]

```

默认并发数为 64，若要修改并发限制

```bash
$ yarn spider --limit [number] [小说名]
```

支持批量下载 小说名之间用空格分开

```bash
$ yarn spider [小说名] [小说名] ...
```

## 运行截图

![](https://cansiny.oss-cn-shanghai.aliyuncs.com/images/1621749960365-1621749953964.png)

## ❗ tips

以下部分为可自定义内容：

下载的小说默认在 `download` 文件夹下，也可以自己在 `config.ts` 配置

章节获取失败重试次数默认 3 次，可在 `config.ts` 配置

保证良好的网络可减少章节缺失率

**如何配置来源网站**

按照如下格式修改 `config.ts` 中的 `source` 数组，无需关心书源顺序

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
      path: "", // 查询书籍的 url
      param: "", // 查询书籍的参数
    },
  }
```
