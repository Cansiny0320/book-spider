import { Spider } from "./spider"
import fs from "fs"

const args = process.argv.slice(2)

if (args[0] === "download") {
  const download = fs.readFileSync("./download.txt", "utf-8").split("\r\n")
  download.forEach(item => {
    new Spider(item)
  })
} else {
  args.forEach(item => {
    new Spider(item)
  })
}