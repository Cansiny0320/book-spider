# 小说爬虫

🎉 开箱即用的高性能可自定义小说爬虫 快速下载无广告 txt 文件

## ✨ 特性

📂 批量下载

🔄 章节获取失败重试

📑 美观的信息提示

⚡ 采用异步并发方式获取页面数据

🈚 去除书籍中的广告

🔧 可自定义配置书籍来源网站

## 💡 使用方法

```bash
$ yarn


$ yarn spider [小说名]

// 或者下载 download.txt 文件中的小说

$ yarn spider download
```

## ❗ tips

支持批量下载 小说名之间用空格分开

下载的小说默认在 download 文件夹，也可以自己在 `config.ts` 配置

章节获取失败重试次数默认 3 次，可在 `config.ts` 配置

保证良好的网络可减少章节缺失率

## 运行截图

![](https://cansiny.oss-cn-shanghai.aliyuncs.com/images/1621749960365-1621749953964.png)
