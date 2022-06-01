import React, { useState, useEffect } from 'react'
import './StudyList.scss'
import { Table, Input, Button } from 'antd'
import SelectFile from '../../components/SelectFile/SelectFile'
import {
  queryStudyByPatientID,
  querySeriesByStudyID,
  queryDicomData,
  deleteTableSql,
  queryData,
  SQLContainer,
} from '../../util/sqlite'

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

  useEffect(() => {
    console.log('t d: ', patientData)
    queryDicomData(getDicomFromDB)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getDicomFromDB = objects => {
    setPatientData(objects)
  }
  const getStudyFromDB = objects => {
    setStudyData(objects)
  }
  const getSeriesFromDB = objects => {
    setSeriesData(objects)
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
    querySeriesByStudyID(record.studyID, seriesGetAll)
  }
  const seriesGetAll = seriesList => {
    selectedData.seriesInfo = Array.isArray(seriesList) ? seriesList : [seriesList]
    props.setData(selectedData)
    console.log('all: ', selectedData)
  }

  const studyRowClicked = (record, index) => {
    // console.log('index: ', index, 'row: ', record)
    querySeriesByStudyID(record.studyID, getSeriesFromDB)
  }

  const seriesRowClicked = (record, index) => {
    // console.log('index: ', index, 'row: ', record)
  }
  const printLog = log => {
    console.log(log)
  }
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    },
    getCheckboxProps: record => ({
      // disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  }

  return (
    <div className="study-list-container">
      <SelectFile importDICOM={importDICOM} setPatientData={setPatientData} setData={props.setData} />
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
            <Button onClick={e => deleteTableSql('dicom_patient')} type="primary">
              删除 patient
            </Button>
            <Button onClick={e => deleteTableSql('dicom_study')} type="primary">
              删除 study
            </Button>
            <Button onClick={e => deleteTableSql('dicom_series')} type="primary">
              删除 series
            </Button>
            <Button onClick={e => queryData(SQLContainer.queryStudySql, printLog)} type="primary">
              查询 study
            </Button>
            <Button onClick={e => queryData(SQLContainer.querySeriesSql, printLog)} type="primary">
              查询 series
            </Button>
          </div>
        </div>
      </div>
      <div className="table-box">
        <header>导入记录</header>
        <Table
          columns={importFilesColumns}
          dataSource={DICOMFiles}
          onRow={record => {
            return {
              onClick: event => {},
              onDoubleClick: event => {},
            }
          }}
        />
      </div>
      <div className="table-box">
        <header>DICOM记录</header>
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
                // history.push(`/viewer/${record.PatientID}`)
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
                seriesGetAll(record)
              },
            }
          }}
        />
      </div>
    </div>
  )
}

export default StudyList
