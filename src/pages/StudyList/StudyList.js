import React, { useState, useEffect } from 'react'
import './StudyList.scss'
import { Table, Input, Button, Spin } from 'antd'
import SelectFile from '../../components/SelectFile/SelectFile'
import {
  queryStudyByPatientID,
  querySeriesByStudyID,
  queryPatientData,
  deleteTableSql,
  queryData,
  SQLContainer, removeAllDuplicated,
} from '../../util/sqlite'
import { formatFile } from '../../util/index'

const dicomColumns = [
  {
    title: '姓名',
    dataIndex: 'patientName',
  },
  {
    title: '性别',
    dataIndex: 'patientGender',
  },
  {
    title: '生日',
    dataIndex: 'patientBirthday',
  },
  {
    title: 'PatientID',
    dataIndex: 'patientID',
  },
  {
    title: '检测次数',
    dataIndex: 'studyNum',
  },
  {
    title: '检查时间',
    dataIndex: 'acquisitionDate',
  },
  {
    title: '添加时间',
    dataIndex: 'addTime',
    defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(a.addTime) - new Date(b.addTime),
  },
  {
    title: '上次修改时间',
    dataIndex: 'LastModifiedTime',
  },
  {
    title: '医院',
    dataIndex: 'institution',
  },
  {
    title: 'CT机品牌型号',
    dataIndex: 'deviceManufacturer',
  },
]

const testColumns = [
  {
    title: '检测日期',
    dataIndex: 'acquisitionDate',
  },
  {
    title: '检测ID',
    dataIndex: 'studyID',
  },
  {
    title: '检测描述',
    dataIndex: 'studyDescription',
  },
  {
    title: '序列数',
    dataIndex: 'sequenceNum',
  },
  {
    title: '添加时间',
    dataIndex: 'addTime',
    defaultSortOrder: 'descend',
    sorter: (a, b) => new Date(a.addTime) - new Date(b.addTime),
  },
]

const listColumns = [
  {
    title: '序列号',
    dataIndex: 'seriesNo',
  },
  {
    title: '序列描述',
    dataIndex: 'seriesDescription',
  },
  // {
  //   title: '层厚',
  //   dataIndex: 'thick',
  // },
  {
    title: '形式',
    dataIndex: 'modality',
  },
  {
    title: '影像大小',
    dataIndex: 'size',
  },
  {
    title: '帧数',
    dataIndex: 'frameNum',
  },
  {
    title: '添加时间',
    dataIndex: 'acquisitionDate',
    // defaultSortOrder: 'descend',
    // sorter: (a, b) => new Date(a.acquisitionDate) - new Date(b.acquisitionDate),
  },
]

const importFilesColumns = [
  {
    title: '文件名',
    dataIndex: 'name',
  },
  {
    title: '大小',
    dataIndex: 'size',
  },
  {
    title: '添加时间',
    dataIndex: 'date',
  },
]

const StudyList = props => {
  const [patientData, setPatientData] = useState([])
  const [studyData, setStudyData] = useState([])
  const [seriesData, setSeriesData] = useState([])
  const [DICOMFiles, importDICOM] = useState([])
  const [selectedData, setSelectedData] = useState([])
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    console.log('t d: ', patientData)
    queryPatientData(getDicomFromDB)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getDicomFromDB = objects => {
    setPatientData(objects)
  }
  const addDicomFromUpload = objects => {
    setPatientData(patientData.concat(objects))
  }

  const getStudyFromDB = objects => {
    setStudyData(objects)
  }
  const getSeriesFromDB = objects => {
    setSeriesData(objects)
    setLoading(false)
  }

  const patientRowClicked = record => {
    // console.log('row: ', record)
    if (selectedData.patientID !== record.patientID) {
      setSeriesData(null)
    }
    queryStudyByPatientID(record.patientID, getStudyFromDB)
    setSelectedData(record)
  }

  const getAllByPatientID = studyList => {
    // set the first of list as study record
    selectedData.studyInfo = studyList[0]
    querySeriesByStudyID(selectedData.studyInfo.studyID, seriesGetAll)
  }

  const patientGetAll = record => {
    queryStudyByPatientID(record.patientID, getAllByPatientID)
  }
  const studyGetAll = record => {
    selectedData.studyInfo = record
    querySeriesByStudyID(record.studyID, seriesGetAll)
  }
  const seriesGetAll = (seriesList, selectedIndex) => {
    // console.log(selectedIndex)
    // check whether user get all series by selected from patient and study table or from series table
    if (selectedIndex) {
      selectedData.seriesInfo = Array.isArray(seriesData) ? seriesData : [seriesData]
      selectedData.seriesInfo[selectedIndex].active = true
    } else {
      selectedData.seriesInfo = Array.isArray(seriesList) ? seriesList : [seriesList]
      selectedData.seriesInfo[0].active = true
    }
    const promises = []
    // get all imageID and bind all imageIds to series
    selectedData.seriesInfo.forEach(ele => {
      ele.imageIDList = formatFile(ele.framePath)
      promises.push(ele.imageIDList)
    })
    Promise.all(promises).then(res => {
      // console.log('promises:', res)
      // check if file is inexistent when path is exists in DB
      if (res.findIndex(x => x == undefined) >= 0) {
        console.log('no file be found')
      } else {
        // set the dcm image as cover
        res.forEach((ele, index) => {
          selectedData.seriesInfo[index].cover = ele[0]
        })
        props.setData(selectedData)
        // console.log('all: ', selectedData)
        props.setShowViewer(true)
      }
    })
  }

  const studyRowClicked = (record, index) => {
    // console.log('index: ', index, 'row: ', record)
    querySeriesByStudyID(record.studyID, getSeriesFromDB)
  }

  const seriesRowClicked = (record, index) => {
    // console.log('index: ', index, 'row: ', record)
  }
  const printLog = log => {
    // console.log(log)
  }
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    },
    getCheckboxProps: record => ({
      // disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  }
  const removeDuplicates = () => {
    removeAllDuplicated(getDicomFromDB)
    // 关闭study 和series列表，需要手动打开
    getStudyFromDB([])
    getSeriesFromDB([])
  }

  return (
    <div className="study-list-container">
      {
        isLoading ? <div className="mask">
          <Spin size="large" />
        </div> : null
      }
      <div>
              <SelectFile importDICOM={importDICOM} setPatientData={setPatientData} setData={props.setData}
                          setLoading={setLoading}
                          addDicomFromUpload={addDicomFromUpload} removeDuplicates={removeDuplicates}/>
              <div className="search-box-wrap">
                <div className="search-box">
                  <div className="search-group">
                    <span>姓名：</span>
                    <Input style={{ width: 200 }} placeholder="请输入姓名" />
                  </div>
                  <div className="search-btns">
                    <Button type="primary">检索</Button>
                    <Button onClick={e => props.setShowViewer(true)} type="primary">
                      重置
                    </Button>
                    {/* <Button onClick={e => deleteTableSql('dicom_patient')} type="primary">
                      删除 patient
                    </Button>
                    <Button onClick={e => deleteTableSql('dicom_study')} type="primary">
                      删除 study
                    </Button>
                    <Button onClick={e => deleteTableSql('dicom_series')} type="primary">
                      删除 series
                    </Button>
                    <Button onClick={e => queryData(SQLContainer.queryPatientSql, printLog)} type="primary">
                      查询 patient
                    </Button>
                    <Button onClick={e => queryData(SQLContainer.queryStudySql, printLog)} type="primary">
                      查询 study
                    </Button>
                    <Button onClick={e => queryData(SQLContainer.querySeriesSql, printLog)} type="primary">
                      查询 series
                    </Button>
                    <Button onClick={e => removeDuplicates } type="primary">
                      去重 Patient
                    </Button> */}
                  </div>
                </div>
              </div>
              {/*<div className="table-box">*/}
              {/*  <header>导入记录</header>*/}
              {/*  <Table*/}
              {/*      columns={importFilesColumns}*/}
              {/*      dataSource={DICOMFiles}*/}
              {/*      onRow={record => {*/}
              {/*        return {*/}
              {/*          onClick: event => {},*/}
              {/*          onDoubleClick: event => {},*/}
              {/*        }*/}
              {/*      }}*/}
              {/*  />*/}
              {/*</div>*/}
              <div className="table-box">
                <header>病人列表</header>
                <Table
                    rowSelection={{
                      ...rowSelection,
                    }}
                    columns={dicomColumns}
                    dataSource={patientData}
                    onRow={record => {
                      return {
                        onClick: () => {
                          patientRowClicked(record)
                        },
                        onDoubleClick: event => {

                          console.log('Patient list: ', patientData)
                          patientGetAll(record)
                        },
                      }
                    }}
                />
              </div>
              <div className="table-box">
                <header>检测记录</header>
                <Table
                    columns={testColumns}
                    dataSource={studyData}
                    onRow={(record, index) => {
                      return {
                        onClick: () => {
                          studyRowClicked(record, index)
                        },
                        onDoubleClick: event => {
                          // history.push(`/viewer/${record.PatientID}`)
                          // console.log('Study list: ', patientData)
                          studyGetAll(record)
                        },
                      }
                    }}
                />
              </div>
              <div className="table-box">
                <header>序列清单</header>
                <Table
                    columns={listColumns}
                    dataSource={seriesData}
                    onRow={(record, index) => {
                      return {
                        onClick: () => {
                          seriesRowClicked(record, index)
                        },
                        onDoubleClick: event => {
                          seriesGetAll(record, index)
                        },
                      }
                    }}
                />
              </div>
            </div>
    </div>
  )
}

export default StudyList
