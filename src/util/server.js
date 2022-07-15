const http = require("http");
const PORT = process.env.PORT || 56565;
const sqlite = require('sqlite3');
const fs = require('fs')
const resourceDir = 'resources/db'
const resourceExists = fs.existsSync('resources/db')
const filePath = 'resources/db/dicom.db'
const winston = require('winston')

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'logger.log' }),
    ],
});

// 如果不存在则创建
if (!resourceExists) {
    fs.mkdirSync(resourceDir)
    console.log('resourceDir: ', resourceDir)
}

const server = http.createServer(async (req, res) => {
    //set the request route
    if (req.url === "/api/queryPatientData" && req.method === "GET") {
        //response headers
        queryPatientData(data => {
            res.writeHead(200, { "Content-Type": "application/json" });
            //set the response
            res.write(JSON.stringify(data));
            //end the response
            res.end();
        })
    } else if (req.url === "/api/createSeriesTable" && req.method === "POST") {
        createTable(SQLContainer.dicomSeriesSql, ()=> {
            res.writeHead(200, { "Content-Type": "application/json" });
            //set the response
            res.write('创建成功');
            // logger.info('Created Series table')
            //end the response
            res.end();
        })
    } else if (req.url === "/api/updateNode" && req.method === "POST") {
        let chunk = ''
        req.on("data", (data) => {
            chunk += data
            chunk = JSON.parse(chunk)
            updateSeriesSuggest(chunk.suggest, chunk.studyId, chunk.seriesNo, ()=> {
                res.writeHead(200, { "Content-Type": "application/json" });
                //set the response
                res.write('修改成功');
                //end the response
                res.end();
            })
        })

    } else if (req.url === "/api/deleteNode" && req.method === "POST") {
        let chunk = ''
        req.on("data", (data) => {
            chunk += data
            chunk = JSON.parse(chunk)
            deleteNodeData(chunk.noduleNum, () => {
                res.writeHead(200, { "Content-Type": "application/json" });
                //set the response
                res.write('删除成功');
                //end the response
                res.end();
            })
        })
    }

    // If no route present
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Not find this API" }));
    }
});
// 是否存在db文件
if (!fs.existsSync(filePath)) {
    fs.openSync(filePath, 'w')
    server.listen(PORT, () => {
        console.log(`server started on port: ${PORT}`);
    });
} else {
    server.listen(PORT, () => {
        console.log(`server started on port: ${PORT}`);
    });
}


const a = new Date()
const sqlite3 = new sqlite.Database(filePath)
console.log('server: ',a.getTime(), ', db:',sqlite3)

const createTable = function (sql, callback) {
    sqlite3.serialize(function () {
        sqlite3.run(sql, function (err) {
            if (null != err) {
                console.log('ERR:', err)
                return
            }
            if (callback) {
                callback()
            }
        })
    })
}

const queryData = function (sql, callback) {
    sqlite3.all(sql, function (err, rows) {
        if (null != err) {
            console.log('ERR server:', err)
            console.log('rows',rows)
            if (!rows || rows.length <= 0) {
                if (callback) {
                    callback([])
                }
            }
            return
        }

        /// deal query data.
        if (callback) {
            callback(rows)
        }
    })
}

const executeSql = function (sql) {
    sqlite3.run(sql, function (err) {
        if (null != err) {
            // DB.printErrorInfo(err);
            console.log('ERR:', err)
        }
    })
};

const close = function () {
    sqlite3.close()
}

const SQLContainer = {
    dicomSeriesSql:
        'create table if not exists dicom_series(id integer NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, key varchar(64),studyID varchar(32),seriesNo varchar(32),seriesDescription varchar(255), layer varchar(32), modality varchar(32),acquisitionDate varchar(255),size varchar(32),addTime varchar(32),frameNum varchar(32),suggest varchar(255))',
    queryPatientSql: 'select * from dicom_patient',
}

const queryPatientData = (DBFunction, patientID) => {
    const sql = patientID ? ` where patientID ='${patientID}'` : ''
    logger.info(`Query Patient data from server` + sql)
    queryData(SQLContainer.queryPatientSql + sql, DBFunction)
}

const updateSeriesSuggest = (suggest, studyId, seriesNo, callback) => {
    const sql = `update dicom_series set suggest = '${suggest}' where studyId = '${studyId}' and seriesNo = '${seriesNo}'`
    logger.info(`Update SeriesSuggest that studyId = '${studyId}' and seriesNo = '${seriesNo}'`)
    queryData(sql, callback)
}

const deleteNodeData = (noduleNum, callback) => {
    const sql = `delete from node_list where noduleNum = '${noduleNum}'`
    logger.info(sql)
    queryData(sql, callback)
}

module.exports=server
