const { app, BrowserWindow } = require('electron')
const path = require('path')
const RockeyArm = require('./src/util/RockeyArm')
const { Menu } = require('electron')
const { dialog } = require('electron')
const dongle = new RockeyArm()
const ret = dongle.Enum()
server = require('./src/util/server')
// 浏览器窗口.

const url = require('url')
let mainWindow

function createWindow() {
  // 创建一个浏览器窗口.
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 1110,
    webPreferences: {
      nodeIntegration: true, //允许使用node的方式引入
      contextIsolation: false,
      webSecurity: false, // 允许使用本地资源
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#d3e4f5',
  })
  console.log('p: ', app.getPath('appData'))
  // 这里要注意一下，这里是让浏览器窗口加载网页。
  // 如果是开发环境，则url为http://localhost:3000（package.json中配置）
  // 如果是生产环境，则url为build/index.html
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/build/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  // 加载网页之后，会创建`渲染进程`
  // mainWindow.loadURL(startUrl)
  mainWindow.loadURL(`http://localhost:3000`)

  // 打开chrome浏览器开发者工具.
  // if (startUrl.startsWith('http')) {
  //   mainWindow.webContents.openDevTools()
  // }
  mainWindow.webContents.openDevTools()
  // mainWindow.on('closed', function () {
  //   mainWindow = null
  // })
}

app.on('ready', () => {
  if (ret.result === 'success') {
    createWindow()
    Menu.setApplicationMenu(null)
  } else {
    dialog.showErrorBox('未授权', '请插入正确的加密狗以后在使用本软件。')
  }

  setInterval(() => {
    const dongle = new RockeyArm()
    const ret = dongle.Enum() 
    console.log(ret)
    if (ret.result !== 'success') {
      dialog.showErrorBox('未授权', '请插入正确的加密狗以后在使用本软件。')
      app.quit()
    }
  }, 3000)
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    server.close()
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
