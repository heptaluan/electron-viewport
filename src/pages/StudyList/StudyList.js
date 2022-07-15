import React, { useState, useEffect } from 'react'
import './StudyList.scss'
import { Table, Input, Button, message } from 'antd'
import SelectFile from '../../components/SelectFile/SelectFile'
import {
  queryStudyByPatientID,
  querySeriesByStudyID,
  queryPatientData,
  removeAllDuplicated,
  queryAllNodeList,
  queryPatientList,
  deleteTableSql,
  queryInstanceByStudyID,
} from '../../util/sqlite'
import { formatFile, downloadFile, queryPatientAPI, createSeriesAPI } from '../../util/index'
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
    render: (txt) => <span>{txt.split('_')[0]}</span>,
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
    render: (txt) => <span>{txt.split('_')[0]}</span>,
  },
  {
    title: '序列描述',
    dataIndex: 'seriesDescription',
  },
  {
    title: '层厚',
    dataIndex: 'layer',
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
    dataIndex: 'frameNum',
  },
  {
    title: '添加时间',
    dataIndex: 'acquisitionDate',
  },
]

const StudyList = props => {
  const [patientData, setPatientData] = useState([])
  const [studyData, setStudyData] = useState([])
  const [seriesData, setSeriesData] = useState([])
  const [selectedData, setSelectedData] = useState([])
  const [isLoading, setLoading] = useState(0)
  const [selectedRows, setSelectedRows] = useState([])
  const [searchData, setSearchData] = useState('')

  useEffect(() => {
    // queryPatientData(getDicomFromDB)
    if (!isLoading) {
      setLoading(1)
      queryPatientAPI().then(res => {
        getDicomFromDB(res["data"])
        setLoading(0)
      }).catch(err => {
        console.log(err)
      })
    }

    createSeriesAPI().then(res => {
      // console.log('res: ', res)
    }).catch(err => {
      console.log(err)
    })
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

  const getSeriesFromDB = (objects, loading, isSeriesGetAll) => {
    if (objects.length > 0) {
      queryInstanceByStudyID(objects[0].studyID, (res) => {
        // console.log(res)
        objects.forEach(ele => {
          const framePath = []
          const instanceNumber = []
          res.forEach(x => {
            if (ele.seriesNo === x.seriesNo) {
              framePath.push(x.framePath)
              instanceNumber.push(x.instanceNumber)
              ele.frameNum ++
            }
          })
          ele.instanceNumber = sortPathByInstanceNumber(instanceNumber, framePath, 0)
          ele.framePath = sortPathByInstanceNumber(instanceNumber, framePath, 1)
          // console.log(ele)
        })
        setSeriesData(objects)
        if (isSeriesGetAll) {
          seriesGetAll(objects)
        }
        if (loading) {
          setLoading(2)
        }
      })
    } else {
      setSeriesData(objects)
      if (loading) {
        setLoading(2)
      }
    }
  }

  const sortPathByInstanceNumber = (instanceNumbers, paths, returnIndex) => {
    const indices = [...instanceNumbers.keys()]
    indices.sort((x,y) => instanceNumbers[x] - instanceNumbers[y])
    paths = indices.map(i=>paths[i])
    instanceNumbers = indices.map(i=>instanceNumbers[i])
    if (returnIndex === 0) {
      return instanceNumbers
    } else if (returnIndex === 1) {
      return paths
    }
  }

  const patientRowClicked = record => {
    if (selectedData.patientID !== record.patientID) {
      setSeriesData(null)
    }
    queryStudyByPatientID(record.patientID, getStudyFromDB)
    setSelectedData(record)
  }

  const getAllByPatientID = studyList => {
    selectedData.studyInfo = studyList[0]
    querySeriesByStudyID(selectedData.studyInfo.studyID, e => getSeriesFromDB(e, false, true))
  }

  const patientGetAll = record => {
    queryStudyByPatientID(record.patientID, getAllByPatientID)
  }

  const studyGetAll = record => {
    selectedData.studyInfo = record
    querySeriesByStudyID(record.studyID, e => getSeriesFromDB(e, false, true))
  }

  const seriesGetAll = (seriesList, selectedIndex) => {
    if (selectedIndex || selectedIndex === 0) {
      selectedData.seriesInfo = Array.isArray(seriesData) ? seriesData : [seriesData]
      selectedData.seriesInfo[selectedIndex].active = true
    } else {
      selectedData.seriesInfo = Array.isArray(seriesList) ? seriesList : [seriesList]
      selectedData.seriesInfo[0].active = true
    }
    const promises = []
    selectedData.seriesInfo.forEach(ele => {
      ele.imageIDList = formatFile(ele.framePath)
      promises.push(ele.imageIDList)
    })
    Promise.all(promises).then(res => {
      // check if file is inexistent when path is exists in DB
      if (res.findIndex(x => x == undefined) >= 0) {
        console.log('no file be found')
        message.error("此序列文件缺失，请检查DICOM文件是否存在")
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
    querySeriesByStudyID(record.studyID, getSeriesFromDB)
  }

  const seriesRowClicked = (record, index) => {
    // console.log('index: ', index, 'row: ', record)
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows)
    },
    getCheckboxProps: record => ({
      // disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  }
  const removeDuplicates = () => {
    removeAllDuplicated(getDicomFromDB)
    // 关闭 study 和 series 列表，需要手动打开
    getStudyFromDB([])
    getSeriesFromDB([], true)
  }

  // 导出结节信息
  const handleExport = () => {
    if (selectedRows.length === 0) {
      message.warn(`请先选择需要导出的病人`)
    }

    selectedRows.forEach(item => {
      queryAllNodeList(item.patientID, res => {
        const exportData = []
        for (let i = 0; i < res.length; i++) {
          exportData.push({
            patientID: res[i].patientID,
            seriesNo: res[i].seriesNo,
            imageIndex: res[i].imageIndex,
            nodeBox: res[i].nodeBox,
          })
        }
        const fileName = `病人ID-${item.patientID}`
        downloadFile(exportData, fileName)
      })
    })
  }

  const handleSearch = (type) => {
    if (type === 'reset') {
      setSearchData('')
    }
    queryPatientList(type === 'reset' ? '' : searchData, res => {
      console.log(res)
      getDicomFromDB(res)
      getStudyFromDB([])
      getSeriesFromDB([])
    })
  }

  const selectedRowStyle = (record, index) => {
    let resource = null
    switch (index) {
      case 0:
        resource = patientData
        break;
      case 1:
        resource = studyData
        break;
      case 2:
        resource = seriesData
        break;
    }
    resource.forEach(ele => {
      ele.styleActive = false
      if (ele.key === record.key) {
        ele.styleActive = true
      }
    })
    if (index === 2) {
      setSeriesData([...resource])
    }
  }

  return (
    <div className="study-list-container">
      <div>
        <SelectFile
          setPatientData={setPatientData}
          setData={props.setData}
          setLoading={setLoading}
          isLoading={isLoading}
          addDicomFromUpload={addDicomFromUpload}
          removeDuplicates={removeDuplicates}
        />
        <div className="search-box-wrap">
          <div className="search-box">
            <div className="search-group">
              <Input value={searchData} style={{ width: 400 }} placeholder="请输入内容进行模糊查询" onChange={e => setSearchData(e.target.value)} />
            </div>
            <div className="search-btns">
              <Button type="primary" onClick={handleSearch}>检索</Button>
              <Button onClick={e=> handleSearch('reset')} type="primary">
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
                    <Button onClick={e => deleteTableSql('dicom_instance')} type="primary">
                      删除 instance
                    </Button>
              {/*<Button onClick={e => setLoading(1)} type="primary">*/}
              {/*  loading*/}
              {/*</Button>*/}
              {/*<Select defaultValue={10} style={{ width: 120 }} onChange={e => changeTimeInterval(e)}>*/}
              {/*  <Option value={10}>10</Option>*/}
              {/*  <Option value={20}>20</Option>*/}
              {/*  <Option value={30}>30</Option>*/}
              {/*  <Option value={45}>45</Option>*/}
              {/*</Select>*/}
                    {/*<Button onClick={e => changeTimeInterval(20)} type="primary">*/}
                    {/*  changeTimeInterval*/}
                    {/*</Button>*/}
                    {/*<Button onClick={e => removeDuplicates } type="primary">*/}
                    {/*  去重 Patient*/}
                    {/*</Button>*/}
            </div>
          </div>
        </div>
        <div className="table-box">
          <header className="export-box">
            <span>DICOM记录</span>
            <Button onClick={handleExport}>导出结节信息</Button>
          </header>
          <Table
            rowSelection={{
              ...rowSelection,
            }}
            columns={dicomColumns}
            dataSource={patientData}
            showSorterTooltip={false}
            size={'small'}
            rowClassName={(record, index) => record['styleActive'] ? 'rowClick' : '' }
            onRow={record => {
              return {
                onClick: () => {
                  patientRowClicked(record)
                  selectedRowStyle(record, 0)
                },
                onDoubleClick: event => {
                  // console.log('Patient list: ', patientData)
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
            showSorterTooltip={false}
            size={'small'}
            rowClassName={(record, index) => record['styleActive'] ? 'rowClick' : '' }
            onRow={(record, index) => {
              return {
                onClick: () => {
                  studyRowClicked(record, index)
                  selectedRowStyle(record, 1)
                },
                onDoubleClick: event => {
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
            size={'small'}
            rowClassName={(record, index) => record['styleActive'] ? 'rowClick' : '' }
            onRow={(record, index) => {
              return {
                onClick: () => {
                  seriesRowClicked(record, index)
                  selectedRowStyle(record, 2)
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
