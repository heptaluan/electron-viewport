const fs = window.fs
const dbDir = window.join(window.rootPath, '/db')
const filePath = window.join(dbDir, 'dicom.db')
const sqlite = window.sqlite.verbose()

const exists = fs.existsSync(dbDir)
let needInit = false
// 如果不存在则创建
if (!exists) {
  fs.mkdirSync(dbDir)
}
// 是否存在db文件
if (!fs.existsSync(filePath)) {
  fs.openSync(filePath, 'w')
  // 初始化数据库
  needInit = true
}

const sqlite3 = new sqlite.Database(filePath)

export const createTable = function (sql) {
  sqlite3.serialize(function () {
    sqlite3.run(sql, function (err) {
      if (null != err) {
        console.log('ERR:', err)
        return
      }
    })
  })
}

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
export const insertData = (sql, objects, callback) => {
  sqlite3.serialize(function () {
    const stmt = sqlite3.prepare(sql)
    // debugger
    // console.log(objects)
    for (let i = 0; i < objects.length; ++i) {
      const temp = []
      for (const k in objects[i]) {
        if (objects[i].hasOwnProperty(k)) {
          if (typeof objects[i][k] !== 'object') {
            temp.push(objects[i][k])
          }
        }
      }
      stmt.run(temp)
    }
    stmt.finalize(callback)
  })
}

export const queryData = function (sql, callback) {
  sqlite3.all(sql, function (err, rows) {
    if (null != err) {
      console.log('ERR:', err)
      return
    }

    /// deal query data.
    if (callback) {
      callback(rows)
    }
  })
}

export const deleteTableSql = function (name) {
  const sql = 'DROP TABLE if exists ' + name
  sqlite3.run(sql, function (err) {
    if (null != err) {
      // DB.printErrorInfo(err);
      console.log('ERR:', err)
    }
  })
}
export const executeSql = function (sql) {
  sqlite3.run(sql, function (err) {
    if (null != err) {
      // DB.printErrorInfo(err);
      console.log('ERR:', err)
    }
  })
}

export const close = function () {
  sqlite3.close()
}

/// export SqliteDB.
export default sqlite3

export const SQLContainer = {
  dicomPatientSql:
    'create table if not exists dicom_patient(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, patientKey varchar(64),patientID varchar(32),patientName varchar(32),patientGender varchar(32), patientBirthday varchar(32),acquisitionDate varchar(255),institution varchar(32),deviceManufacturer varchar(32),deviceModelName varchar(32),addTime varchar(32),studyNum varchar(32))',
  dicomStudySql:
    'create table if not exists dicom_study(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, patientKey varchar(64),patientID varchar(32),acquisitionDate varchar(255), studyID varchar(32), studyDescription varchar(32),addTime varchar(255),sequenceNum varchar(32))',
  dicomSeriesSql:
    'create table if not exists dicom_series(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, patientKey varchar(64),studyID varchar(32),seriesNo varchar(32),seriesDescription varchar(255), modality varchar(32),acquisitionDate varchar(255),size varchar(32),addTime varchar(32),framePath varchar(255),frameNum varchar(32))',
  insertPatientSql:
    'insert into dicom_patient(patientKey, patientName,patientID,patientGender,patientBirthday,acquisitionDate,institution, deviceManufacturer,deviceModelName,addTime,studyNum) values(?,?, ?, ?,?, ?, ?,?, ?, ?,?)',
  insertStudySql:
    'insert into dicom_study(patientKey, patientID,acquisitionDate, studyID, studyDescription,addTime,sequenceNum ) values(?,?,?,?,?,?,?)',
  insertSeriesSql:
    'insert into dicom_series(patientKey, studyID,seriesNo,seriesDescription, modality,acquisitionDate,size,addTime,framePath,frameNum) values(?,?,?,?,?,?,?,?,?,?)',
  nodeListSql:
    'create table if not exists node_list(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, patientID varchar(32), seriesNo varchar(32), imageIndex varchar(32), noduleName varchar(32), noduleNum varchar(32), lungLocation varchar(32), lobeLocation varchar(32), featureLabel varchar(32), noduleSize varchar(32), suggest varchar(32), nodeBox varchar(255), diameter varchar(32), maxHu varchar(32), minHu varchar(32), meanHu varchar(32), diameterNorm varchar(32), centerHu varchar(32))',
  insertNodeListSql:
    'insert into node_list(patientID, seriesNo, imageIndex, noduleName, noduleNum, lungLocation, lobeLocation, featureLabel, noduleSize, suggest, nodeBox, diameter, maxHu, minHu, meanHu, diameterNorm, centerHu ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  queryPatientSql: 'select * from dicom_patient',
  queryStudySql: 'select * from dicom_study',
  querySeriesSql: 'select * from dicom_series',
  queryNodeListSql: 'select * from node_list',
}

export const queryDicomData = DBFunction => {
  queryData(SQLContainer.queryPatientSql, DBFunction)
}

export const queryStudyByPatientID = (patientID, DBFunction) => {
  const sql = ` where patientID ='${patientID}'`
  queryData(SQLContainer.queryStudySql + sql, DBFunction)
}

export const querySeriesByStudyID = (studyID, DBFunction) => {
  const sql = ` where studyID = '${studyID}'`
  queryData(SQLContainer.querySeriesSql + sql, DBFunction)
}

export const queryNodeList = (patientID, seriesNo, callback) => {
  const sql = ` where patientID = '${patientID}' and seriesNo = '${seriesNo}'`
  queryData(SQLContainer.queryNodeListSql + sql, callback)
}

createTable(SQLContainer.dicomPatientSql)
createTable(SQLContainer.dicomStudySql)
createTable(SQLContainer.dicomSeriesSql)
createTable(SQLContainer.nodeListSql)
