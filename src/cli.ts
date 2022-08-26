import { cac } from 'cac'
import pkg from '../package.json'
import { main } from './index'

const cli = cac('book-spider')

cli
  .command('[...names]', '小说名', {
    allowUnknownOptions: true,
  })
  .option('-s, --source <source>', '设置书源')
  .option('-t, --turn', '顺序下载')
  .option('-l, --limit <number>', '限制并发数', {
    default: 64,
  })
  .example('  $ bs 铁血残明')
  .example('  $ bs 铁血残明 -s https://www.xbiquge.la')
  .example('  $ bs list')
  .action((names, options) => {
    main({
      bookNames: names,
      ...options,
    })
  })

cli
  .command('download', '批量下载小说')
  .option('-s, --source <source>', '设置书源')
  .option('-t, --turn', '顺序下载')
  .option('-l, --limit <number>', '限制并发数', {
    default: 64,
  })
  .action(options => {
    main({
      download: true,
      ...options,
    })
  })
cli.command('list', '显示所有书源').action(() => {
  console.log(
    [
      'https://www.biquge.com.cn',
      'https://www.xbiquge.la',
      'https://www.xbiquwx.la',
      'https://www.qu-la.com',
      'https://www.shuquge.com',
    ].join('\n'),
  )
})

cli
  .help(sections => {
    const [versionSection, usageSection] = sections
    versionSection.body = `book-spider v${pkg.version}`
    usageSection.body = `  $ bs <小说名 小说名...> [参数]
  $ book-spider <小说名 小说名...> [参数]`
    sections[2].title = 'Other Commands'
    const [, ...otherCommands] = sections[2].body.split('\n')
    sections[2].body = otherCommands.join('\n')
  })
  .version(pkg.version)
  .parse()
