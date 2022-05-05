/**
 * Created by 9I
 * @Date 2022/2/17
 * @description
 */

// import { fs, path, initSqlJs, dbName, dbPath } from '@/electron'
// import initSqlJs from 'sql.js/dist/sql-wasm'

const sqlite = window.sqlite
const dbPath = window.dbPath
// const filebuffer = fs.readFileSync(dbPath)
// const db = new sqlite.Database(dbPath)
const verbose = sqlite.verbose()
const db = new verbose.Database(dbPath)
// console.log(db)
// db.serialize(() => {
//   db.all('select * from dicom_sys', function (err, res) {
//     if (!err) {
//       console.log(JSON.stringify(res))
//     } else {
//       console.log(err)
//     }
//   })
// })

export const runSql = async (sql) => {
  return new Promise(async (resolve, reject) => {
    db.run(sql, (err) => {
      resolve(err)
    })
  })
}
//查询
export const queryPromise = async (sql) => {
  return new Promise(async (resolve, reject) => {
    db.all(sql, function (err, rows) {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

export default db
// const initSQL = async function () {
//   const sql = await initSqlJs()
//   const db = new SQL.Database(filebuffer);
//   return db
// }
// initSqlJs().then(SQL => {
//   // 创建数据库连接
//   const db = new SQL.Database(filebuffer);
//   const sql = 'select * from dicom_sys'
//   // 插入两行：(1,111) and (2,222)
//   db.run(sql)
//   // 将数据库导出到包含SQLite数据库文件的Uint8Array
//   // export() 返回值: ( Uint8Array ) — SQLite3数据库文件的字节数组
//   const data = db.export();
//   console.log(data)
//   // 由于安全性和可用性问题，不建议使用Buffer()和new Buffer()构造函数
//   // 改用new Buffer.alloc()、Buffer.allocUnsafe()或Buffer.from()构造方法
//   // var buffer = new Buffer(data);
//   // var buffer = Buffer.from(data, 'binary');
//   // // 被创建数据库名称
//   // var filename = "d.sqlite";
//   // fs.writeFileSync(filename, buffer);
//   // document.querySelector('#result').innerHTML = filename + "Created successfully.";
// });
// const dbHelper = initSQL()
// export default dbHelper
