const { app, BrowserWindow } = require('electron')
const path = require('path')
const initDongle = require('./src/util/dongle')
const { Menu } = require('electron')
const { dialog } = require('electron')
const ret = initDongle()
// console.log('test : ', ret)
let count = 0


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
  // mainWindow.webContents.openDevTools()
  // mainWindow.on('closed', function () {
  //   mainWindow = null
  // })
}

function onRequest(request, response) {
  response.end(); //close the response
  request.connection.end(); //close the socket
  request.connection.destroy; //close it really
  server.close(); //close the server
}

function closeApplication() {
  server.on("request", onRequest);
  server.on("close", function() {console.log("closed");});
  app.quit()
}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  });

  try {
    server = require("./src/util/server")
    goOn = true
  } catch (e) {
    dialog.showErrorBox('打开方式不正确', '必须由软件中导入DICOM文件')
    app.quit()
  }

  if (goOn) {
    // Electron 会在初始化后并准备
    // 创建浏览器窗口时，调用这个函数。
    // 部分 API 在 ready 事件触发后才能使用，同时隐藏菜单栏
    app.on('ready', (event) => {
      console.log(ret)
      if (ret.param && ret.param.result === 'success') {
        createWindow()
        Menu.setApplicationMenu(null)

        const timer = setInterval(() => {
          const ret = initDongle()
          // console.log('gg: ', ret)
          count += 1
          // console.log('count: ', count)
          if (!ret.param || ret.param.result !== 'success') {
            dialog.showErrorBox('未授权', '请插入正确的加密狗以后再使用本软件。')
            clearInterval(timer)
            server.on("request", onRequest);
            server.on("close", function() {console.log("closed");});
            app.quit()
          }
        }, 10* 1000)
      } else {
        dialog.showErrorBox('未授权', '请插入正确的加密狗再使用本软件。')
        closeApplication()
      }
    })

    // 当全部窗口关闭时退出。
    app.on('window-all-closed', () => {
      // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
      // 否则绝大部分应用及其菜单栏会保持激活。
      if (process.platform !== 'darwin') {
        closeApplication()
      }
    })

    // 在这个文件中，你可以续写应用剩下主进程代码。
    // 也可以拆分成几个文件，然后用 require 导入。

  }
}