import React, {useEffect, useState} from 'react'
import './SelectFile.scss'
import * as path from "path";
import {Button, message, Modal, Spin} from 'antd'
import cornerstone from 'cornerstone-core'
import {readFileInfo, dicomDateTimeToLocale, keyFormat} from "../../util";
import {insertData, queryInstanceData, querySeriesByStudyID, SQLContainer} from "../../util/sqlite";
import About from "../About/About";
import {getDicomType} from "../../util/index";
import {CheckCircleTwoTone, ExclamationCircleTwoTone} from "@ant-design/icons";

const SelectFile = (props) => {
    const [visible, setVisible] = useState(false)
    const [CDVisible, setCDVisible] = useState(false)
    // const [isLoading, setLoading] = useState(0)
    const [importFailed, setImportFailed] = useState(0)
    const [importSucceed, setImportSucceed] = useState(0)
    const [importDuplicated, setImportDuplicated] = useState(0)
    const [importSucceedCounter, setImportSucceedCounter] = useState(0)
    const [importFailedCounter, setImportFailedCounter] = useState(0)
    const [importDuplicatedCounter, setImportDuplicatedCounter] = useState(0)
    const [fileAmount, setFileAmount] = useState(0)
    let isSeriesDuplicate = false
    let dicomList = []
    let patientList = []
    let studyList = []
    let seriesList = []
    let indexKey = 0

    useEffect(() => {
        // console.log('kkk: ', importSucceed)
        setTimeout(() => {
            setImportSucceedCounter(importSucceed);
        }, 10);
    }, [importSucceed])
    useEffect(() => {
        setTimeout(() => {
            setImportFailedCounter(importFailed);
        }, 10);
    }, [importFailed])
    useEffect(() => {
        setTimeout(() => {
            setImportDuplicatedCounter(importDuplicated);
        }, 10);
    }, [importDuplicated])

    const creatPatient = (dict, time) => {
        const theDay = dict['00080022'] ? dict['00080022'].Value[0] : dict['00080020'].Value[0]
        const theTime = dict['00080032'] ? dict['00080032'].Value[0] : dict['00080030'].Value[0]
        try {
            // patientList.push(
            return {
                    key: keyFormat(dict['00100020'].Value[0] + '_'+ theDay),
                    patientName: dict['00100010'].Value[0],
                    patientID: dict['00100020'].Value[0],
                    patientGender: dict['00100040'].Value[0],
                    patientBirthday: dict['00100030'].Value[0],
                    acquisitionDate: dicomDateTimeToLocale(theDay + '.' + theTime),
                    institution: dict['00080080'] ? dict['00080080'].Value[0] : 'No Institution',
                    deviceManufacturer: dict['00080070'].Value[0],
                    deviceModelName: dict['00081090'] ? dict['00081090'].Value[0] : 'No Model Name',
                    addTime: time,
                    studyNum: 0,
                    studyInfo: []
                }
            // )

        } catch (err) {
            // console.log('patient err: ', err)
            // return false
        }
    }
    const createStudy = (dict, time) => {
        const theDay = dict['00080022'] ? dict['00080022'].Value[0] : dict['00080020'].Value[0]
        const theTime = dict['00080032'] ? dict['00080032'].Value[0] : dict['00080030'].Value[0]
        try {
            // studyList.push(
               return  {
                key: dict['00100020'].Value[0] + '_' + dict['00200010'].Value[0],
                patientID: dict['00100020'].Value[0],
                acquisitionDate:  dicomDateTimeToLocale(theDay + '.' + theTime),
                seriesInfo: [],
                studyID: studyIDFormat(dict),
                studyDescription: dict['00081030'].Value[0],
                addTime: time,
                sequenceNum: 0
            }
            // )
        } catch (err) {
            // console.log('study err: ', err)
            // return false
        }
    }
    const createSeries = (dict, time) => {
        const theDay = dict['00080022'] ? dict['00080022'].Value[0] : dict['00080020'].Value[0]
        const theTime = dict['00080032'] ? dict['00080032'].Value[0] : dict['00080030'].Value[0]

        try {
            // seriesList.push(
               return  {
                key: dict['00100020'].Value[0] + '_' + dict['00200011'].Value[0],
                studyID: studyIDFormat(dict),
                seriesNo: seriesNoFormat(dict),
                seriesDescription: dict['0008103E'].Value[0],
                layer: dict['00180050'].Value[0] + 'mm',
                modality: dict['00080060'].Value[0],
                acquisitionDate:  dicomDateTimeToLocale(theDay + '.' + theTime),
                size: dict['00280010'].Value[0] + ' x ' + dict['00280011'].Value[0],
                addTime: time,
                patientInfo: {
                    patientName: dict['00100010'].Value[0],
                    patientID: dict['00100020'].Value[0],
                    patientGender: dict['00100040'].Value[0],
                    patientBirthday: dict['00100030'].Value[0],
                },
                instanceNumber: [],
                framePath: [],
                frameNum: 0
            }
            // )
        } catch (err) {
            // console.log('series err: ', err)
            // return false
        }
        // console.log("seriesList: ", seriesList)
    }
    const createInstance = (dict, path,time) => {
        const theDay = dict['00080022'] ? dict['00080022'].Value[0] : dict['00080020'].Value[0]
        const theTime = dict['00080032'] ? dict['00080032'].Value[0] : dict['00080030'].Value[0]

        try {
           return  {
                key: dict['00100020'].Value[0] + '_' + dict['00200011'].Value[0],
                studyID: studyIDFormat(dict),
               seriesNo: seriesNoFormat(dict),
               specialID: dict['00200013'].Value[0] + dict['0020000E'].Value[0],
                instanceNumber: dict['00200013'].Value[0],
                seriesInstanceUID: dict['0020000E'].Value[0],
                framePath: path,
                acquisitionDate:  dicomDateTimeToLocale(theDay + '.' + theTime),
                addTime: time
            }
        } catch (err) {
            // console.log('series err: ', err)
            // return false
        }
    }

    const checkDICOMIntegrity = (dict) => {
        const now = new Date().toLocaleString()
        const patientPartInLocal = creatPatient(dict, now)
        const studyPartInLocal = createStudy(dict, now)
        const seriesPartInLocal = createSeries(dict, now)
        return patientPartInLocal && studyPartInLocal && seriesPartInLocal
    }

    const createDBTables= (dict) => {
        const now = new Date().toLocaleString()
        indexKey++
        const patientPartInLocal = creatPatient(dict, now)
        const studyPartInLocal = createStudy(dict, now)
        const seriesPartInLocal = createSeries(dict, now)
        isSeriesDuplicate=false
        // check whether the patientID of upload file is existed in whole files
        const indexPatient = patientList.findIndex( x => x.patientID === dict['00100020'].Value[0])
        const indexStudy = studyList.findIndex( x => x.studyID === studyIDFormat(dict))
        const indexSeries = seriesList.findIndex( x => x.seriesNo === seriesNoFormat(dict))

        if (patientPartInLocal && studyPartInLocal && seriesPartInLocal) { // file is correct
            if (indexPatient === -1) {
                patientList.push(patientPartInLocal)
            }
            if (indexStudy === -1) {
                studyList.push(studyPartInLocal)
            }
            if (indexSeries === -1) {
                seriesList.push(seriesPartInLocal)
            }
            setImportSucceed(prev => prev + 1)
        } else {
            setImportFailed(prev => prev + 1)
        }
    }

    const studyIDFormat = (dict) => {
        try {
            return dict['00200010'].Value[0] + '_' + dict['0020000D'].Value[0]
        } catch (err) {
            // console.log('studyID err: ', err)
        }
    }
    const seriesNoFormat = (dict) => {
        try {
            return dict['00200011'].Value[0] + '_' + dict['0020000E'].Value[0]
        } catch (err) {
            // console.log('seriesNo err: ', err)
        }
    }

    const DicomBuilder = () => {
        studyList.forEach(studyEle => {
            seriesList.forEach(sEle => {
                if (studyEle.studyID === sEle.studyID) {
                    studyEle.sequenceNum ++
                    studyEle.seriesInfo.push(sEle)
                }
            })
        })
        patientList.forEach(pEle => {
            studyList.forEach(studyEle => {
                if (pEle.patientID === studyEle.patientID) {
                    pEle.studyNum ++
                    pEle.studyInfo.push(studyEle)
                }
            })
        })
    }

    const importHandler = () => {
        let inputObj = null
        if (document.getElementById('_ef')) {
            inputObj = document.getElementById('_ef')
            // remove the existed input element and eventListener
            inputObj.removeEventListener('change', function () {})
            document.body.removeChild(inputObj)
        }
        inputObj = document.createElement('input')
        // 设置属性
        inputObj.setAttribute('id', '_ef')
        inputObj.setAttribute('type', 'file')
        inputObj.setAttribute('accept', '*/dicom,.dcm, image/dcm, */dcm, .dicom')
        inputObj.setAttribute('multiple', '')
        inputObj.setAttribute('style', 'visibility:hidden')
        inputObj.setAttribute('webkitdirectory', '')
        inputObj.setAttribute('directory', '')
        // 添加到DOM中
        document.body.appendChild(inputObj)

        // 添加事件监听器
        inputObj.addEventListener('change', openDir)
        // // 模拟点击
        inputObj.click()
    }
    // const getDicomFromDB = (objects) => {
    //     props.addDicomFromUpload([...objects])
    // }
    const checkDICMType = (file, dicmBox) => {
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.readAsArrayBuffer(file);
            reader.onload = (evt) => {
                if (evt.target.readyState === FileReader.DONE) {
                    let array = new Uint8Array(evt.target.result);
                    let s = "";
                    let start = 128, end = 132;
                    for (let i = start; i < end; ++i) {
                        s += String.fromCharCode(array[i]);
                    }
                    if (s == "DICM") {
                        dicmBox.push(file)
                        resolve(file)
                    } else {
                        resolve(null)
                        console.log(file.name,' is not dicom')
                    }
                }
            }
        })
    }

    const openDir = () => {

        // console.log(files)
        props.setLoading(1)
        setImportSucceed(0)
        setImportFailed(0)
        setFileAmount(0)
        setImportDuplicated(0)
        querySeriesByStudyID(null, uploadData)
    }

    const createInstanceList = (list) => {
        const now = new Date().toLocaleString()
        queryInstanceData(res => {
            console.log(res)
            const decodeFileList = []
            list.forEach(ele => {
                const dicomDict = readFileInfo(ele)
                const dict = dicomDict['dict']
                const meta = dicomDict['meta']
                const dicomTypeList = getDicomType()
                const dicomType = dicomTypeList[meta['00020002']['Value'][0]].ciod
                if ( dicomType !== 'CT Image') {
                    setImportFailed(prev => prev + 1)
                } else {
                    const instanceNumber = dict['00200013'].Value[0]
                    const seriesInstanceUID = dict['0020000E'].Value[0]
                    if ((dicomList.length == 0 || dicomList.filter(e => e.specialID === instanceNumber + seriesInstanceUID).length == 0) &&
                        res.filter(e => e.specialID === instanceNumber + seriesInstanceUID).length == 0
                    ) {
                        if (checkDICOMIntegrity(dict)) {
                            dicomList.push(createInstance(dict, ele.path,now))
                            decodeFileList.push(dict)
                        } else {
                            setImportFailed(prev => prev + 1)
                        }
                    } else if (dicomList.filter(e => e.specialID === instanceNumber + seriesInstanceUID).length > 0 ||
                        res.filter(e => e.specialID === instanceNumber + seriesInstanceUID).length > 0) {
                        setImportDuplicated(prev => prev + 1)
                        isSeriesDuplicate = true
                    }
                }
            })

            insertData(SQLContainer.insertInstanceSql, dicomList,(res) => {
                // console.log(res)
                // const innerPromises =[]
                decodeFileList.forEach(ele => {
                    // innerPromises.push(createDBTables(ele))
                    createDBTables(ele)
                })
                // Promise.all(innerPromises).then(innerRes=> {
                //     console.log('finished')
                    DicomBuilder()
                    console.log('list: ', patientList, ', d: ', studyList,', s: ', seriesList)
                    if (patientList.length > 0 && studyList.length > 0 && seriesList.length > 0) {
                        insertData(SQLContainer.insertPatientSql, patientList);
                        insertData(SQLContainer.insertStudySql, studyList);
                        // seriesList.forEach(ele => {
                        //     ele.framePath = ele.framePath.toString()
                        //     ele.instanceNumber = ele.instanceNumber.toString()
                        // })
                        // console.log('s: ',seriesList)
                        insertData(SQLContainer.insertSeriesSql, seriesList, props.removeDuplicates);
                        // props.setLoading(2)
                    } else if (isSeriesDuplicate) {
                        props.setLoading(2)
                    } else {
                        message.warning(`所导入的DICOM文件不是有效的文件`)
                        props.setLoading(0)
                    }
                // })
            })
        })
    }


    const uploadData = (allSeries) => {
        const inputObj = document.getElementById('_ef')
        const files = inputObj.files

        try {
            // console.log('allSeries', allSeries)
            // 临时变量的值赋给输出路径
            // this.dirPath = files
            if (files.length > 0) {
                const fileArr = new Set(files)
                const tempArr = Array.from(fileArr)
                // console.log('File list: ', tempArr)
                // check the files are dcm or not
                const promises = []
                const dicmBox = []
                for(let i of tempArr) {
                    promises.push(checkDICMType(i, dicmBox))
                }
                Promise.all(promises).then(res=> {
                    // console.log(res,',',dicmBox)
                    if (dicmBox.length > 0) {
                        setFileAmount(dicmBox.length)
                        createInstanceList(dicmBox)
                        // console.log(dicomList)
                    } else {
                        message.warning(`所选文件夹内没有有效的DICOM文件`)
                        props.setLoading(0)
                    }
                }).catch(reason => {
                    console.log(reason)
                    props.setLoading(0)
                })
            }
            // 移除事件监听器
            inputObj.removeEventListener('change', function () {})
            // 从DOM中移除input
            document.body.removeChild(inputObj)
        } catch (error) {
            console.log(error)
            props.setLoading(0)
        }
    }

    const CDImportHandler = () => {
        setCDVisible(true)
    }

    const openCDImport = () => {
        setCDVisible(false)
        importHandler()
    }

  return (
    <div className="select-file-box">
        {props.isLoading > 0 ? (
            <div className="mask">
                <div className="maskWhite">
                    {
                        props.isLoading == 2 ?  <CheckCircleTwoTone twoToneColor="#52c41a" /> : <Spin size="large" />
                    }
                    <div className="importProgress">
                        <div className="itemTxt">
                            DICOM文件数量: {fileAmount <= 0 ? '加载中' : fileAmount}
                        </div>
                        <div className="itemTxt">
                            导入成功: {importSucceedCounter}
                        </div>
                        <div className="itemTxt">
                            导入失败的非标准DICOM: {importFailedCounter}
                        </div>
                        <div className="itemTxt">
                            重复文件: {importDuplicatedCounter}
                            {/*重复文件: {fDup}*/}
                        </div>
                    </div>
                    <Button onClick={e => props.setLoading(0)} type="primary" disabled={props.isLoading < 2}>
                        确定
                    </Button>
                </div>
            </div>
        ) : null}
      <Button onClick={() => {
          importHandler()
      }}>本地导入</Button>
      <Button onClick={() => {
          CDImportHandler()
      }}>光盘导入</Button>
      <div className='about' onClick={() => setVisible(true)}>关于</div>

        <Modal
            title="关于"
            centered
            visible={visible}
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            bodyStyle={{
                height: 400,
            }}
            width={600}
            footer={null}
        >
            <About />
        </Modal>
        <Modal
            title="光盘导入提示"
            centered
            visible={CDVisible}
            onOk={() => setCDVisible(false)}
            onCancel={() => setCDVisible(false)}
            bodyStyle={{
                height: 240,
            }}
            width={600}
            footer={null}
        >
            <div className='cdImport'>
                <ExclamationCircleTwoTone twoToneColor="#ffcf00" />
                <div className='txt'>
                    从光盘中直接导入需要花费数分钟时间，推荐先手动将DICOM文件夹复制到本地硬盘，再用本地导入，则更节省时间。
                    若需要从光盘中导入，点击’确定‘按钮。
                </div>
                <div className='btnGroup'>
                    <Button onClick={e => openCDImport()} type="primary">
                        确定
                    </Button>
                    <Button onClick={() => setCDVisible(false)}>
                        取消
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
  )
}

export default SelectFile
