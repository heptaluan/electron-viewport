const fs = window.fs
const path = window.path
const winston = window.winston
const dbSlot = 'resources/'
const backup = 'backup/'
const backupTimer = window.backupTimer

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//       winston.format.timestamp(),
//       winston.format.printf(({ level, message, timestamp }) => {
//         return `${timestamp} ${level}: ${message}`;
//       })
//   ),
//   transports: [
//     new winston.transports.File({ filename: 'logger.log' }),
//   ],
// });

const resourceDir = path.resolve(dbSlot)
const dbDir = path.resolve(dbSlot + 'db')
const backupDBDir = path.resolve(backup)
const filePath = window.join(dbDir, 'dicom.db')
const sqlite = window.sqlite.verbose()
const resourceExists = fs.existsSync(resourceDir)
const backupExists = fs.existsSync(backupDBDir)
const exists = fs.existsSync(dbDir)
// 如果不存在则创建
if (!resourceExists) {
  fs.mkdirSync(resourceDir)
  // console.log('resourceDir: ', resourceDir)
}
if (!exists) {
  fs.mkdirSync(dbDir)
  // console.log('dbDir: ', dbDir)
}
if (!backupExists) {
  fs.mkdirSync(backupDBDir)
  // console.log('backupDBDir: ', backupDBDir)
}

const calculateDate = (days) => {
  const fileStats = fs.statSync(filePath) // read the db's time attribute
  const now = new Date()
  let timeInterval = null
  if (fs.readdirSync(backupDBDir).length > 0) { // It was reached backup time already
    const fsList = []
    fs.readdirSync(backupDBDir).forEach(ele => {
      fsList.push(ele.slice(0, -3))
    })
    fsList.sort((a,b) => a -b)
    console.log(fsList)
    timeInterval = now.getTime() - fsList[fsList.length - 1]
  } else { // first time to back up
    timeInterval = now.getTime() - fileStats.birthtimeMs
  }
  const dayGap = Number((timeInterval / 1000 / 60 / 60 / 24).toFixed(2))
  // console.log('timeInterval: ',days)
  return dayGap > days
}
const backupDBFile = () => {
  const now = new Date()
  const timeName = now.getTime() + '.db'
  const destination = window.join(backupDBDir, timeName)
  fs.copyFile(filePath, destination, (err) => {
    if (err) throw err;
    console.log(filePath,' was copied to ', destination);
    // logger.info(filePath+` was copied to `+ destination)
  });
}

export const changeTimeInterval = function () {
  const backupDay = (backupTimer && !isNaN(backupTimer.backupInterval) && backupTimer.backupInterval > 0) ? backupTimer.backupInterval : 10
  if (calculateDate(backupDay)) {
    backupDBFile()
  }
}

// 是否存在db文件
if (!fs.existsSync(filePath)) {
  fs.openSync(filePath, 'w')
} else {
  // judge the date and decide whether to copy db file to destination folder
  changeTimeInterval()
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
      console.log('ERR sqlite:', err)
      console.log('rows',rows)
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
    'create table if not exists dicom_patient(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, key varchar(64),patientID varchar(32),patientName varchar(32),patientGender varchar(32), patientBirthday varchar(32),acquisitionDate varchar(255),institution varchar(32),deviceManufacturer varchar(32),deviceModelName varchar(32),addTime varchar(32),studyNum varchar(32))',
  dicomStudySql:
    'create table if not exists dicom_study(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, key varchar(64),patientID varchar(32),acquisitionDate varchar(255), studyID varchar(32), studyDescription varchar(32),addTime varchar(255),sequenceNum varchar(32))',
  dicomSeriesSql:
    'create table if not exists dicom_series(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, key varchar(64),studyID varchar(32),seriesNo varchar(32),seriesDescription varchar(255), layer varchar(32), modality varchar(32),acquisitionDate varchar(255),size varchar(32),addTime varchar(32),frameNum varchar(32),suggest varchar(255))',
  dicomInstanceSql:
    'create table if not exists dicom_instance(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, key varchar(64),studyID varchar(64),seriesNo varchar(32),specialID varchar(255),instanceNumber varchar(32),seriesInstanceUID varchar(255),framePath varchar(255), acquisitionDate varchar(255),addTime varchar(32), UNIQUE(specialID))',
  insertPatientSql:
    'insert into dicom_patient(key, patientName,patientID,patientGender,patientBirthday,acquisitionDate,institution, deviceManufacturer,deviceModelName,addTime,studyNum) values(?,?, ?, ?,?, ?, ?,?, ?, ?,?)',
  insertStudySql:
    'insert into dicom_study(key, patientID,acquisitionDate, studyID, studyDescription,addTime,sequenceNum ) values(?,?,?,?,?,?,?)',
  insertSeriesSql:
    'insert into dicom_series(key, studyID,seriesNo,seriesDescription, layer, modality,acquisitionDate,size,addTime,frameNum) values(?,?,?,?,?,?,?,?,?,?)',
  insertInstanceSql:
    'insert OR IGNORE into dicom_instance(key, studyID, seriesNo, specialID, instanceNumber, seriesInstanceUID,framePath, acquisitionDate,addTime) values(?,?,?,?,?,?,?,?,?)',
  queryPatientSql: 'select * from dicom_patient',
  queryStudySql: 'select * from dicom_study',
  querySeriesSql: 'select * from dicom_series',
  queryInstanceSql: 'select * from dicom_instance',

  nodeListSql:
    'create table if not exists node_list(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, patientID varchar(32), seriesNo varchar(32), imageIndex varchar(32), noduleName varchar(32), noduleNum varchar(32), lungLocation varchar(32), lobeLocation varchar(32), featureLabel varchar(32), suggest varchar(32), nodeBox varchar(255))',
  insertNodeListSql:
    'insert into node_list(patientID, seriesNo, imageIndex, noduleName, noduleNum, lungLocation, lobeLocation, featureLabel, suggest, nodeBox ) values(?,?,?,?,?,?,?,?,?,?)',
  queryNodeListSql: 'select * from node_list',

  removePatientDuplicated:
    'delete from dicom_patient where dicom_patient.rowid not in (select MAX(dicom_patient.rowid) from dicom_patient group by key, patientID)',
  removeStudyDuplicated:
    'delete from dicom_study where dicom_study.rowid not in (select MAX(dicom_study.rowid) from dicom_study group by key, studyID)',
  removeSeriesDuplicated:
    'delete from dicom_series where dicom_series.rowid not in (select MAX(dicom_series.rowid) from dicom_series group by key, seriesNo)',
}

export const removeAllDuplicated = patientCallback => {
  queryData(SQLContainer.removePatientDuplicated, res1 => {
    queryData(SQLContainer.removeStudyDuplicated, res2 => {
      queryData(SQLContainer.removeSeriesDuplicated, res3 => {
        queryData(SQLContainer.queryPatientSql, patientCallback)
        // queryData(SQLContainer.queryStudySql,studyCallback)
        // queryData(SQLContainer.querySeriesSql,seriesCallback)
      })
    })
  })
}

// export const queryInstanceList = (DBFunction, datalist) => {
//   console.log(datalist)
//   const sql = ` where 'instanceNumber' ='${instanceNumber}' and 'seriesInstanceUID' = '${seriesInstanceUID}'`
//   queryData(SQLContainer.queryInstanceExistSql, DBFunction)
// }


export const queryInstanceData = (DBFunction, instanceNumber, seriesInstanceUID) => {
  const sql = (instanceNumber && seriesInstanceUID) ? ` where instanceNumber ='${instanceNumber}' and seriesInstanceUID = '${seriesInstanceUID}'` : ''
  // logger.info(`Query Instance data` + sql)
  queryData(SQLContainer.queryInstanceSql + sql, DBFunction)
}
export const queryInstanceByStudyID = ( studyID, DBFunction) => {
  const sql = ` where studyID ='${studyID}'`
  // logger.info(`Query Instance data that studyID ='${studyID}'`)
  queryData(SQLContainer.queryInstanceSql + sql, DBFunction)
}

export const queryPatientData = (DBFunction, patientID) => {
  const sql = patientID ? ` where patientID ='${patientID}'` : ''
  // logger.info(`Query Patient data` + sql)
  queryData(SQLContainer.queryPatientSql + sql, DBFunction)
}

export const queryStudyByPatientID = (patientID, DBFunction) => {
  const sql = ` where patientID ='${patientID}'`
  // logger.info(`Query Study data that patientID ='${patientID}'`)
  queryData(SQLContainer.queryStudySql + sql, DBFunction)
}

export const querySeriesByStudyID = (studyID, DBFunction) => {
  const sql = studyID ? ` where studyID = '${studyID}'` : ''
  // logger.info(`Query Series data` + sql )
  queryData(SQLContainer.querySeriesSql + sql, DBFunction)
}

export const queryNodeList = (patientID, seriesNo, callback) => {
  const sql = ` where patientID = '${patientID}' and seriesNo = '${seriesNo}'`
  // logger.info(`Query NodeList data that patientID = '${patientID}' and seriesNo = '${seriesNo}'`)
  queryData(SQLContainer.queryNodeListSql + sql, callback)
}

export const queryAllNodeList = (patientID, callback) => {
  const sql = ` where patientID = '${patientID}'`
  // logger.info(`Query NodeList data that patientID = '${patientID}'`)
  queryData(SQLContainer.queryNodeListSql + sql, callback)
}

export const updateSeriesSuggest = (suggest, studyId, seriesNo, callback) => {
  const sql = `update dicom_series set suggest = '${suggest}' where studyId = '${studyId}' and seriesNo = '${seriesNo}'`
  queryData(sql, callback)
}

export const querySeriesSuggest = (studyId, seriesNo, callback) => {
  const sql = ` where studyID = '${studyId}' and seriesNo = '${seriesNo}'`
  // logger.info(`Query SeriesSuggest that studyID = '${studyId}' and seriesNo = '${seriesNo}'`)
  queryData(SQLContainer.querySeriesSql + sql, callback)
}

export const queryPatientList = (value, callback) => {
  const sql = ` select * from dicom_patient where patientName like '%${value}%' or patientGender like '%${value}%' or patientID like '%${value}%' or patientBirthday like '%${value}%' or acquisitionDate like '%${value}%' or institution like '%${value}%' or deviceManufacturer like '%${value}%' or deviceModelName like '%${value}%' or addTime like '%${value}%' or studyNum like '%${value}%'
  `
  // logger.info(`Query PatientList from search input box by input value equal '${value}'`)
  queryData(sql, callback)
}

export const deleteNodeData = (noduleNum, callback) => {
  const sql = `delete from node_list where noduleNum = '${noduleNum}'`
  queryData(sql, callback)
}

createTable(SQLContainer.dicomPatientSql)
// logger.info('Created Patient table')
createTable(SQLContainer.dicomStudySql)
// logger.info('Created Study table')

// createTable(SQLContainer.dicomSeriesSql)
createTable(SQLContainer.dicomInstanceSql)
// logger.info('Created Instance table')

createTable(SQLContainer.nodeListSql)
