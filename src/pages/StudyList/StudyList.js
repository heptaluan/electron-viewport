import React, { useState, useEffect } from 'react'
import './StudyList.scss'
import { useHistory } from 'react-router-dom'
import { Table, Input, Button } from 'antd'
import SelectFile from '../../components/SelectFile/SelectFile'

const dicomColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '性别',
    dataIndex: 'sex',
  },
  {
    title: '生日',
    dataIndex: 'birthday',
  },
  {
    title: 'PatientID',
    dataIndex: 'PatientID',
  },
  {
    title: '检测次数',
    dataIndex: 'testNum',
  },
  {
    title: '检查时间',
    dataIndex: 'testTime',
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
    dataIndex: 'hospital',
  },
  {
    title: 'CT机品牌型号',
    dataIndex: 'CTModel',
  },
]

const testColumns = [
  {
    title: '检测日期',
    dataIndex: 'testTime',
  },
  {
    title: '检测D',
    dataIndex: 'testId',
  },
  {
    title: '检测描述',
    dataIndex: 'testDetail',
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
    dataIndex: 'sequenceNum',
  },
  {
    title: '序列描述',
    dataIndex: 'sequenceDetail',
  },
  {
    title: '层厚',
    dataIndex: 'thick',
  },
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
    dataIndex: 'fps',
  },
  {
    title: '添加时间',
    dataIndex: 'addTime',
  },
]

const StudyList = () => {
  const history = useHistory()

  const [dicomData, setDicomData] = useState([])
  const [testData, setTestData] = useState([])
  const [listData, setListData] = useState([])

  useEffect(() => {
    setDicomData([
      {
        key: '1',
        name: 'LIU XUE BING',
        sex: 'F',
        birthday: '1987-02-01',
        PatientID: 'P00017650152',
        testNum: '1',
        testTime: '2022-04-15 12:00:02',
        addTime: '2022-04-15 12:00:02',
        LastModifiedTime: '',
        hospital: 'SD Chest Hosp',
        CTModel: 'SIEMENS SOMATOM DEFINITION',
      },
      {
        key: '2',
        name: 'LIU XUE BING',
        sex: 'F',
        birthday: '1987-02-01',
        PatientID: 'P00017650152',
        testNum: '1',
        testTime: '2022-04-15 12:00:02',
        addTime: '2022-04-15 12:00:02',
        LastModifiedTime: '',
        hospital: 'SD Chest Hosp',
        CTModel: 'SIEMENS SOMATOM DEFINITION',
      },
      {
        key: '3',
        name: 'LIU XUE BING',
        sex: 'F',
        birthday: '1987-02-01',
        PatientID: 'P00017650152',
        testNum: '1',
        testTime: '2022-04-15 12:00:02',
        addTime: '2022-04-15 12:00:02',
        LastModifiedTime: '',
        hospital: 'SD Chest Hosp',
        CTModel: 'SIEMENS SOMATOM DEFINITION',
      },
    ])
  }, [])

  const handleTableRowClicked = (event) => {
    setTestData([
      {
        key: '1',
        testTime: '2022-04-15',
        testId: '454841',
        testDetail: '检测描述',
        sequenceNum: '25',
        addTime: '2022-05-06 16:16:33',
      },
      {
        key: '2',
        testTime: '2022-04-15',
        testId: '454841',
        testDetail: '检测描述',
        sequenceNum: '25',
        addTime: '2022-05-06 16:16:33',
      },
      {
        key: '3',
        testTime: '2022-04-15',
        testId: '454841',
        testDetail: '检测描述',
        sequenceNum: '25',
        addTime: '2022-05-06 16:16:33',
      },
    ])
    setListData([
      {
        key: '1',
        sequenceNum: '602',
        sequenceDetail: 'HEAD STND 5mm',
        thick: '5mm',
        modality: 'CT',
        size: '512X512',
        fps: '1',
        addTime: '2022-04-15 12:00:02',
      },
      {
        key: '2',
        sequenceNum: '602',
        sequenceDetail: 'HEAD STND 5mm',
        thick: '5mm',
        modality: 'CT',
        size: '512X512',
        fps: '1',
        addTime: '2022-04-15 12:00:02',
      },
      {
        key: '3',
        sequenceNum: '602',
        sequenceDetail: 'HEAD STND 5mm',
        thick: '5mm',
        modality: 'CT',
        size: '512X512',
        fps: '1',
        addTime: '2022-04-15 12:00:02',
      },
    ])
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    },
    getCheckboxProps: (record) => ({
      // disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  }

  return (
    <div className="study-list-container">
      <SelectFile />
      <div className="search-box-wrap">
        <div className="search-box">
          <div className="search-group">
            <span>姓名：</span>
            <Input style={{ width: 200 }} placeholder="请输入姓名" />
          </div>
          <div className="search-btns">
            <Button type="primary">检索</Button>
            <Button type="primary">重置</Button>
          </div>
        </div>
      </div>
      <div className="table-box">
        <header>DICOM记录</header>
        <Table
          rowSelection={{
            ...rowSelection,
          }}
          columns={dicomColumns}
          dataSource={dicomData}
          onRow={(record) => {
            return {
              onClick: (event) => {
                handleTableRowClicked(event)
              },
              onDoubleClick: (event) => {
                history.push(`/viewer/${record.PatientID}`)
              },
            }
          }}
        />
      </div>
      <div className="table-box">
        <header>检测记录</header>
        <Table columns={testColumns} dataSource={testData} />
      </div>
      <div className="table-box">
        <header>序列清单</header>
        <Table columns={listColumns} dataSource={listData} />
      </div>
    </div>
  )
}

export default StudyList
