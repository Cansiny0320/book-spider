import fs from "fs"
import optimist from "optimist"
import { IOptions } from "./interface"
const argv = optimist.argv

import { Spider } from "./spider"
import { getSpecSource } from "./utils"

const bookNames = argv._ as string[]
const url = argv.source as string

const options: IOptions = {}

if (url) {
  options.source = getSpecSource(url)
}

if (bookNames[0] === "download") {
  const download = fs.readFileSync("./download.txt", "utf-8").split("\r\n")
  download.forEach(item => {
    new Spider(item, options)
  })
} else {
  bookNames.forEach(item => {
    new Spider(item, options)
  })
}
