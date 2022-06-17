import React from 'react'
import './SelectFile.scss'
import * as path from "path";
import { Button } from 'antd'
import cornerstone from 'cornerstone-core'
import {readFileInfo, addDicomFile, dicomDateTimeToLocale, keyFormat} from "../../util";
import {insertData, SQLContainer} from "../../util/sqlite";

const SelectFile = (props) => {
    let patientList = []
    let studyList = []
    let seriesList = []
    let indexKey = 0
    const creatPatient = (dict, time) => {
        patientList.push(
            {
                key: keyFormat(dict['00100020'].Value[0] + '_'+ dict['00080022'].Value[0]),
                patientName: dict['00100010'].Value[0],
                patientID: dict['00100020'].Value[0],
                patientGender: dict['00100040'].Value[0],
                patientBirthday: dict['00100030'].Value[0],
                acquisitionDate: dicomDateTimeToLocale(dict['00080022'].Value[0] + '.' + dict['00080032'].Value[0]),
                institution: dict['00080080'].Value[0],
                deviceManufacturer: dict['00080070'].Value[0],
                deviceModelName: dict['00081090'].Value[0],
                addTime: time,
                studyNum: 0,
                studyInfo: []
            }
        )
    }
    const createStudy = (dict, time) => {
        studyList.push({
            key: dict['00100020'].Value[0] + '_' + dict['00200010'].Value[0],
            patientID: dict['00100020'].Value[0],
            acquisitionDate:  dicomDateTimeToLocale(dict['00080022'].Value[0] + '.' + dict['00080032'].Value[0]),
            seriesInfo: [],
            studyID: dict['00200010'].Value[0],
            studyDescription: dict['00081030'].Value[0],
            addTime: time,
            sequenceNum: 0
        })
    }
    const createSeries = (dict, time) => {
        seriesList.push( {
            key: dict['00100020'].Value[0] + '_' + dict['00200011'].Value[0],
            studyID: dict['00200010'].Value[0],
            seriesNo: dict['00200011'].Value[0],
            seriesDescription: dict['0008103E'].Value[0],
            // layer
            modality: dict['00080060'].Value[0],
            acquisitionDate:  dicomDateTimeToLocale(dict['00080022'].Value[0] + '.' + dict['00080032'].Value[0]),
            size: dict['00280010'].Value[0] + ' x ' + dict['00280011'].Value[0],
            addTime: time,
            patientInfo: {
                patientName: dict['00100010'].Value[0],
                patientID: dict['00100020'].Value[0],
                patientGender: dict['00100040'].Value[0],
                patientBirthday: dict['00100030'].Value[0],
            },
            // frame: [],
            framePath: [],
            frameNum: 0
        })
    }

    const createDataTables= (file) => {
        const now = new Date().toLocaleString()
        const dicomDict = readFileInfo(file)
        // console.log('dict: ',dicomDict)
        const dict = dicomDict['dict']
        indexKey++
        if (patientList.length <= 0) {
            creatPatient(dict, now)
            createStudy(dict, now)
            createSeries(dict, now)
        }
        const indexPatient = patientList.findIndex( x => x.patientID === dict['00100020'].Value[0])
        if (indexPatient === -1) {
            creatPatient(dict, now)
        }
        const indexStudy = studyList.findIndex( x => x.studyID === dict['00200010'].Value[0])
        if (indexStudy === -1) {
            createStudy(dict, now)
        }
        const indexSeries = seriesList.findIndex( x => x.seriesNo === dict['00200011'].Value[0])
        if (indexSeries === -1) {
            createSeries(dict, now)
        }
        seriesList.forEach(ele => {
            if (ele.seriesNo === dict['00200011'].Value[0]) {
                // console.log('same s')
                ele.frameNum += 1
                // attach the imageId info with series
                // addDicomFile(file).then(imageId => {
                //     ele.frame.push(imageId)
                    ele.framePath.push(file.path)
                // })
            }
        })
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

        const inputObj = document.createElement('input')
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
        const inputObj2 = document.getElementById('_ef')
        const files = inputObj2.files
        // console.log(files)
        props.setLoading(true)
        try {
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
                        dicmBox.forEach(ele => {
                            createDataTables(ele)
                        })
                        DicomBuilder()
                        console.log('list: ', patientList, ', d: ', studyList,', s: ', seriesList)
                        if (patientList.length > 0) {
                            insertData(SQLContainer.insertPatientSql, patientList);
                            insertData(SQLContainer.insertStudySql, studyList);
                            seriesList.forEach(ele => {
                                ele.framePath = ele.framePath.toString()
                            })
                            console.log('s: ',seriesList)
                            insertData(SQLContainer.insertSeriesSql, seriesList, props.removeDuplicates);
                        }
                        // props.importDICOM(dicmBox)
                    } else {
                        alert('not all dicom files!!!!')
                    }
                }).catch(reason => {
                    console.log(reason)
                })
            }
            // 移除事件监听器
            inputObj2.removeEventListener('change', function () {})
            // 从DOM中移除input
            document.body.removeChild(inputObj2)
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className="select-file-box">
      <Button onClick={() => {
          importHandler()
      }}>导入</Button>
      <Button>光盘导入</Button>
    </div>
  )
}

export default SelectFile
