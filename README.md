# 小说爬虫

开箱即用的高性能命令行小说爬虫 🎉

书源来自[笔趣阁](https://www.biquge.com.cn/)

## ✨ 特性

📂 批量下载

↻ 章节获取失败重试

📑 美观的信息提示

⚡ 采用异步并发方式获取页面数据

## 使用方法

```bash
$ yarn

$ yarn spider [小说名]
```

## tips

支持批量下载 小说名之间用空格分开

下载的小说默认在 download 文件夹，也可以自己在 `config.ts` 配置

章节获取失败重试次数默认 3 次，可在 `config.ts` 配置

保证良好的网络可减少章节缺失率

## 运行截图

![](https://cansiny.oss-cn-shanghai.aliyuncs.com/images/1621745075249-1621745042429.png)
