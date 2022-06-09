import React from 'react'
import './SelectFile.scss'
import * as path from 'path'
import { Button } from 'antd'
import dcmjs from 'dcmjs'
import cornerstone from 'cornerstone-core'
import { addDicomFile, dicomDateTimeToLocale } from '../../util'
import { insertData, queryDicomData, SQLContainer } from '../../util/sqlite'

const SelectFile = props => {
  const output = sth => {
    console.log('output: ', props.data.output)
  }
  const cdHandler = sth => {
    console.log('cd: ', sth)
  }
  let isAllDICOMFile = true
  let patientList = []
  let studyList = []
  let seriesList = []
  let indexKey = 0
  const creatPatient = (dict, time) => {
    patientList.push({
      key:
        dict['00100020'].Value[0] +
        ' ' +
        dicomDateTimeToLocale(dict['00080022'].Value[0] + '.' + dict['00080032'].Value[0]),
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
      studyInfo: [],
    })
  }
  const createStudy = (dict, time) => {
    studyList.push({
      key: dict['00100020'].Value[0] + ' ' + dict['00200010'].Value[0],
      patientID: dict['00100020'].Value[0],
      acquisitionDate: dicomDateTimeToLocale(dict['00080022'].Value[0] + '.' + dict['00080032'].Value[0]),
      seriesInfo: [],
      studyID: dict['00200010'].Value[0],
      studyDescription: dict['00081030'].Value[0],
      addTime: time,
      sequenceNum: 0,
    })
  }
  const createSeries = (dict, time) => {
    seriesList.push({
      key: dict['00100020'].Value[0] + ' ' + dict['00200011'].Value[0],
      studyID: dict['00200010'].Value[0],
      seriesNo: dict['00200011'].Value[0],
      seriesDescription: dict['0008103E'].Value[0],
      // layer
      modality: dict['00080060'].Value[0],
      acquisitionDate: dicomDateTimeToLocale(dict['00080022'].Value[0] + '.' + dict['00080032'].Value[0]),
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
      frameNum: 0,
    })
  }
  const readFileInfo = file => {
    const now = new Date().toLocaleString()
    const arrayBuffer = window.fs.readFileSync(file.path).buffer
    const dicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer)
    // console.log('dict: ',dicomDict)
    const dict = dicomDict['dict']
    indexKey++
    if (patientList.length <= 0) {
      creatPatient(dict, now)
      createStudy(dict, now)
      createSeries(dict, now)
    }
    const indexPatient = patientList.findIndex(x => x.patientID === dict['00100020'].Value[0])
    if (indexPatient === -1) {
      creatPatient(dict, now)
    }
    const indexStudy = studyList.findIndex(x => x.studyID === dict['00200010'].Value[0])
    if (indexStudy === -1) {
      createStudy(dict, now)
    }
    const indexSeries = seriesList.findIndex(x => x.seriesNo === dict['00200011'].Value[0])
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
          studyEle.sequenceNum++
          studyEle.seriesInfo.push(sEle)
        }
      })
    })
    patientList.forEach(pEle => {
      studyList.forEach(studyEle => {
        if (pEle.patientID === studyEle.patientID) {
          pEle.studyNum++
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
    inputObj.setAttribute('accept', '*')
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
  const getDicomFromDB = objects => {
    props.setPatientData([...objects])
  }
  const openDir = () => {
    const inputObj2 = document.getElementById('_ef')
    const files = inputObj2.files
    // console.log(files)
    try {
      // 临时变量的值赋给输出路径
      // this.dirPath = files
      if (files.length > 0) {
        const fileArr = new Set(files)
        const tempArr = Array.from(fileArr)
        // console.log('File list: ', tempArr)
        // check the files are dcm or not
        tempArr.map((item, index) => {
          if (item.name.slice(-4) === '.dcm' || item.type === 'application/dicom' || !item.name.includes('.')) {
            item.key = index
          } else if (!item.name.included('.')) {
          } else {
            isAllDICOMFile = false
          }
        })

        if (!isAllDICOMFile) {
          alert('not all dicom files!!!!')
        } else {
          // const imageIdList = []
          tempArr.forEach(ele => {
            readFileInfo(ele)
          })
          DicomBuilder()
          console.log('list: ', patientList, ', d: ', studyList, ', s: ', seriesList)
          if (patientList.length > 0) {
            insertData(SQLContainer.insertPatientSql, patientList, getDicomFromDB(patientList))
            insertData(SQLContainer.insertStudySql, studyList)
            seriesList.forEach(ele => {
              ele.framePath = ele.framePath.toString()
            })
            console.log('s: ', seriesList)
            insertData(SQLContainer.insertSeriesSql, seriesList)
          }
          props.importDICOM(tempArr)
        }
      }
      isAllDICOMFile = true
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
      <Button
        onClick={() => {
          importHandler()
        }}
      >
        导入
      </Button>
      <Button>光盘导入</Button>
      <Button onClick={() => output()}>导出</Button>
    </div>
  )
}

export default SelectFile
