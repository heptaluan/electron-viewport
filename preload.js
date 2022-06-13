// 预加载脚本在渲染器进程加载之前加载，并有权访问两个 渲染器全局 (例如 window 和 document) 和 Node.js 环境
const {join} = require('path')
const fs = require('fs')
const sqlite = require('sqlite3')
const rootPath = join(__dirname, 'src');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }
  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

window.fs = fs
window.sqlite = sqlite
window.rootPath = rootPath
window.join = join
console.log('this is preload')
console.log(__dirname)