import React, { useState, useEffect, useRef } from 'react'
import './Viewer.scss'
import LeftSidePanel from '../../components/LeftSidePanel/LeftSidePanel'
import Toolbar from '../../components/Toolbar/Toolbar'
import ViewerMain from '../../components/ViewerMain/ViewerMain'
import MiddleSidePanel from '../../components/MiddleSidePanel/MiddleSidePanel'
import cornerstone from 'cornerstone-core'
import cornerstoneTools from 'cornerstone-tools'
import MarkNoduleTool from '../../components/common/MarkNoduleTool/MarkNoduleTool'
import AddNoduleTool from '../../components/common/AddNoduleTool/AddNoduleTool'
import { Modal, message } from 'antd'
import Draggable from 'react-draggable'
import AddNewNode from '../../components/common/AddNewNode/AddNewNode'
import {
  insertData,
  queryNodeList,
  SQLContainer,
  queryAllNodeList,
  querySeriesSuggest,
} from '../../util/sqlite'
import useWindowSize from '../../hook/useWindowSize'
import {deleteNodeAPI, downloadFile, updateSuggestAPI} from '../../util/index'

const Viewer = props => {
  const size = useWindowSize()

  // 初始化
  // eslint-disable-next-line no-unused-vars
  const [imagesConfig, setImagesConfig] = useState([])

  // eslint-disable-next-line no-unused-vars
  // const [sequenceListData, setLeftSidePanelData] = useState([])
  const [noduleList, setNoduleList] = useState([])
  const [noduleMapList, setNoduleMapList] = useState([])
  const [noduleSuggest, setNoduleSuggest] = useState('')

  // 当前帧数
  const [currentImageIdIndex, setCurrentImageIdIndex] = useState(0)

  // 视图元素
  const [cornerstoneElement, setCornerstoneElement] = useState(null)

  // 保存 patientID
  const [patientID, setPatientID] = useState('')

  // 临时变量
  const nodeRef = useRef()

  useEffect(() => {
    nodeRef.current = {
      noduleList,
      noduleMapList,
      imagesConfig,
    }
  }, [imagesConfig, noduleList, noduleMapList])

  // 影像信息初始化
  useEffect(() => {
    const seriesInfo = props.data.seriesInfo.find(item => item.active === true)
    const seriesNo = seriesInfo.seriesNo
    const patientID = props.data.patientID
    setPatientID(patientID)

    seriesInfo.imageIDList.then(res => {
      if (res.length > 0) {
        const imagesConfig = []
        for (let i = 0; i < res.length; i++) {
          imagesConfig.push(res[i])
        }
        queryNodeList(patientID, seriesNo, res => {
          formatNodeData(res)
          setImagesConfig([...imagesConfig])
        })
      }
    })
  }, [props.data])

  // 结节总结信息初始化
  useEffect(() => {
    const seriesInfo = props.data.seriesInfo.find(item => item.active === true)
    const studyId = seriesInfo.studyID
    const seriesNo = seriesInfo.seriesNo
    querySeriesSuggest(studyId, seriesNo, res => {
      setNoduleSuggest(res[0].suggest)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 点击序列切换
  const getSelectedSeries = selectedSeries => {
    setCurrentImageIdIndex(0)
    cornerstoneTools.clearToolState(cornerstoneElement, 'MarkNodule')
    cornerstone.updateImage(cornerstoneElement)
    setNoduleList([])
    setNoduleMapList([])

    selectedSeries.imageIDList.then(res => {
      setImagesConfig([...res])
      const seriesNo = selectedSeries.seriesNo
      const studyId = selectedSeries.studyID
      queryNodeList(patientID, seriesNo, data => {
        formatNodeData(data)
      })
      querySeriesSuggest(studyId, seriesNo, data => {
        setNoduleSuggest(data[0].suggest)
      })
      setTimeout(() => {
        addNodeTool(cornerstoneElement, 0)
      }, 200)
    })
  }

  // 启用工具
  const setToolEnable = () => {
    const WwwcTool = cornerstoneTools.WwwcTool
    cornerstoneTools.addTool(WwwcTool)

    const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool
    const RectangleRoiTool = cornerstoneTools.RectangleRoiTool
    const EraserTool = cornerstoneTools.EraserTool
    const MagnifyTool = cornerstoneTools.MagnifyTool
    const EllipticalRoiTool = cornerstoneTools.EllipticalRoiTool
    const AngleTool = cornerstoneTools.AngleTool
    const LengthTool = cornerstoneTools['LengthTool']
    const PanTool = cornerstoneTools.PanTool
    const ZoomTool = cornerstoneTools.ZoomTool

    cornerstoneTools.addTool(StackScrollMouseWheelTool)
    cornerstoneTools.addTool(RectangleRoiTool)
    cornerstoneTools.addTool(EraserTool)
    cornerstoneTools.addTool(MagnifyTool)
    cornerstoneTools.addTool(EllipticalRoiTool)
    cornerstoneTools.addTool(AngleTool)
    cornerstoneTools.addTool(LengthTool)
    cornerstoneTools.addTool(PanTool)
    cornerstoneTools.addTool(ZoomTool)

    // 自定义工具
    cornerstoneTools.addTool(MarkNoduleTool)
    cornerstoneTools.addTool(AddNoduleTool)

    // 默认灰阶调节
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 })
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 2 })
  }

  // 格式化结节数据
  const formatNodeData = resultInfo => {
    const nodulesList = []
    const nodulesMapList = []
    let index = 0
    for (let i = 0; i < resultInfo.length; i++) {
      const item = resultInfo[i]
      const nodeBox = item.nodeBox.split(',')
      nodulesList.push({
        id: index,
        checked: false,
        active: false,
        num: item.imageIndex,
        noduleName: item.noduleName,
        noduleNum: item.noduleNum,
        lung: item.lungLocation,
        lobe: item.lobeLocation,
        type: item.featureLabel,
        featureLabelG: item.featureLabel,
        suggest: item.suggest,
        nodeBox: nodeBox,
      })

      index++

      nodulesMapList.push({
        noduleName: item.noduleName,
        noduleNum: item.noduleNum,
        index: item.imageIndex,
        startX: nodeBox[0],
        startY: nodeBox[1],
        endX: nodeBox[2],
        endY: nodeBox[3],
      })
    }

    setNoduleList([...nodulesList])
    setNoduleMapList([...nodulesMapList])
  }

  // 导出结节信息
  const handleExportExcel = () => {
    queryAllNodeList(patientID, res => {
      // if (res.length === 0) {
      //   message.warn(`当前病人暂无结节信息`)
      //   return false
      // }

      const exportData = []

      for (let i = 0; i < res.length; i++) {
        exportData.push({
          patientID: res[i].patientID,
          seriesNo: res[i].seriesNo,
          imageIndex: res[i].imageIndex,
          nodeBox: res[i].nodeBox,
        })
      }

      const fileName = `病人ID-${patientID}`
      downloadFile(exportData, fileName)
    })
  }

  // ===========================================================

  // 添加结节标注
  const addNodeTool = (cornerstoneElement, index = 0) => {
    const item = nodeRef.current.noduleMapList.filter(item => Number(item.index) === Number(index))
    const checkItme = nodeRef.current.noduleList.find(item => item.checked === true)

    if (item.length >= 1) {
      cornerstoneTools.clearToolState(cornerstoneElement, 'MarkNodule')
      if (checkItme) {
        const checkNode = item.filter(item => item.noduleName === checkItme.noduleName)
        for (let i = 0; i < item.length; i++) {
          const measurementData = {
            visible: true,
            active: true,
            color: item[i].noduleName === (checkNode[0] && checkNode[0].noduleName) ? undefined : 'white',
            invalidated: true,
            handles: {
              start: {
                x: item[i].startX,
                y: item[i].startY,
                highlight: true,
                active: true,
              },
              end: {
                x: item[i].endX,
                y: item[i].endY,
                highlight: true,
                active: true,
              },
            },
          }
          cornerstoneTools.addToolState(cornerstoneElement, 'MarkNodule', measurementData)
        }
      } else {
        for (let i = 0; i < item.length; i++) {
          const measurementData = {
            visible: true,
            active: true,
            color: 'white',
            invalidated: true,
            handles: {
              start: {
                x: item[i].startX,
                y: item[i].startY,
                highlight: true,
                active: true,
              },
              end: {
                x: item[i].endX,
                y: item[i].endY,
                highlight: true,
                active: true,
              },
            },
          }
          cornerstoneTools.addToolState(cornerstoneElement, 'MarkNodule', measurementData)
        }
      }
      cornerstone.updateImage(cornerstoneElement)
    } else {
      cornerstoneTools.clearToolState(cornerstoneElement, 'MarkNodule')
      cornerstone.updateImage(cornerstoneElement)
    }
  }

  // ===========================================================

  // 结节点击事件
  const onCheckChange = (index, num) => {
    handleCheckedListClick(num)
    noduleList.map(item => (item.checked = false))
    noduleList[index].checked = true
    setNoduleList([...noduleList])
  }

  // 列表点击事件
  const handleCheckedListClick = (index, el) => {
    const corElement = el || cornerstoneElement

    // 设置当中帧数
    setCurrentImageIdIndex(index)

    // 设置当前视图选中项
    if (corElement) {
      changeActiveImage(index, corElement)
    }
  }

  // ===========================================================

  // 切换当前工具栏选中项
  const changeToolActive = (checked, type) => {
    if (checked) {
      cornerstoneTools.setToolActive(type, { mouseButtonMask: 1 })
    } else {
      cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 })
    }
  }

  // 设定当前选中工具状态
  const setActiveToolState = () => {
    const activeTool = document.querySelector('.tool-bar-box .active')
    if (activeTool) {
      cornerstoneTools.setToolActive(activeTool.dataset.type, { mouseButtonMask: 1 })
    } else {
      cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 })
    }
  }

  // 工具栏切换
  const handleToolbarClick = (type, checked) => {
    let viewport = cornerstone.getViewport(cornerstoneElement)
    switch (type) {
      case 'Magnify':
      case 'RectangleRoi':
      case 'Eraser':
      case 'EllipticalRoi':
      case 'Angle':
      case 'Length':
      case 'MarkNodule':
      case 'AddNodule':
      case 'Zoom':
      case 'Pan':
        changeToolActive(checked, type)
        break
      case 'hflip':
        viewport.hflip = !viewport.hflip
        cornerstone.setViewport(cornerstoneElement, viewport)
        break
      case 'vflip':
        viewport.vflip = !viewport.vflip
        cornerstone.setViewport(cornerstoneElement, viewport)
        break
      case 'playClip':
        if (checked) {
          cornerstoneTools.playClip(cornerstoneElement, 10)
        } else {
          cornerstoneTools.stopClip(cornerstoneElement)
        }
        break
      case 'Reset':
        cornerstone.reset(cornerstoneElement)
        // windowChange(cornerstoneElement, cornerstone.getImage(cornerstoneElement), 2)
        break
      default:
        break
    }
  }

  // 切换当前视图
  const changeActiveImage = (index, cornerstoneElement) => {
    cornerstone.loadImage(nodeRef.current.imagesConfig[index]).then(image => {
      cornerstone.displayImage(cornerstoneElement, image)
      cornerstoneTools.addStackStateManager(cornerstoneElement, ['stack'])
      cornerstoneTools.addToolState(cornerstoneElement, 'stack', {
        currentImageIdIndex: Number(index),
        imageIds: nodeRef.current.imagesConfig,
      })
    })
  }

  // ===========================================================

  // 格式化提交数据
  const formatPostData = () => {
    const seriesInfo = props.data.seriesInfo.find(item => item.active === true)
    const item = noduleList[noduleList.length - 1]
    const postData = [
      {
        patientID: props.data.patientID,
        seriesNo: seriesInfo.seriesNo,
        imageIndex: item.num,
        noduleName: item.noduleName,
        noduleNum: item.noduleNum,
        lungLocation: item.lung,
        lobeLocation: item.lobe,
        featureLabel: item.type,
        suggest: item.suggest,
        nodeBox: item.nodeBox.toString(),
      },
    ]
    return postData
  }

  // 暂存结节数据
  const saveResults = () => {
    const postData = formatPostData()
    insertData(SQLContainer.insertNodeListSql, postData)
    message.success(`新增结节成功`)
  }

  // ===========================================================

  const draggleRef = React.createRef()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDisabled, setModalDisabled] = useState(true)
  const [modalBounds, setModalBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })
  const [toolList, setToolList] = useState([])

  // 格式化新增结节数据
  const formatNewNodeData = data => {
    const toolList = []
    toolList.push({
      uuid: data.uuid,
      lung: '',
      lobe: '',
      type: undefined,
      suggest: '',
      cachedStats: data.cachedStats,
      startX: data.handles.start.x,
      startY: data.handles.start.y,
      endX: data.handles.end.x,
      endY: data.handles.end.y,
    })
    setToolList(toolList)
  }

  // 更新结节事件
  const updateToolList = (val, type, id) => {
    const checkItme = toolList.find(item => item.uuid === id)
    if (checkItme && type === 'lung') {
      checkItme.lung = val
    }
    if (checkItme && type === 'lobe') {
      checkItme.lobe = val
    }
    if (checkItme && type === 'type') {
      checkItme.type = val
    }
    setToolList([...toolList])
  }

  // 更新医生影像建议内容
  const handleToolListTextareaChange = (e, id) => {
    const checkItme = toolList.find(item => item.uuid === id)
    if (checkItme) {
      checkItme.suggest = e.target.value
      setToolList([...toolList])
    }
  }

  // 建议框失去焦点后保存数据
  const handleToolListTextareaBlur = (e, id) => {
    const checkItme = toolList.find(item => item.uuid === id)
    if (checkItme) {
      checkItme.suggest = e.target.value
      setToolList([...toolList])
    }
  }

  // 新增结节列表
  const handleOk = e => {
    for (let i = 0; i < toolList.length; i++) {
      if (!toolList[i].lung) {
        message.warn(`请选择结节的肺属性后在进行新增`)
        return false
      }

      if (!toolList[i].lobe) {
        message.warn(`请选择结节的肺叶属性后在进行新增`)
        return false
      }

      if (!toolList[i].type) {
        message.warn(`请选择结节的类型属性后在进行新增`)
        return false
      }
    }

    const tool = cornerstoneTools.getToolState(cornerstoneElement, 'AddNodule')
    const newToolData = [...tool.data]
    const toolData = newToolData.pop()

    const startX = toolData.handles.start.x.toFixed(2)
    const startY = toolData.handles.start.y.toFixed(2)
    const endX = toolData.handles.end.x.toFixed(2)
    const endY = toolData.handles.end.y.toFixed(2)

    const imageId = cornerstone.getImage(cornerstoneElement).imageId
    const imageIndex = nodeRef.current.imagesConfig.findIndex(item => item === imageId)

    const newNoduleList = {
      active: false,
      checked: false,
      lobe: toolList[0].lobe,
      lung: toolList[0].lung,
      noduleName: `nodule_${toolList[0].uuid}`,
      noduleNum: toolList[0].uuid,
      num: imageIndex,
      suggest: toolList[0].suggest,
      type: toolList[0].type,
      nodeBox: [startX, startY, endX, endY],
    }

    const newNoduleMapList = {
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      noduleNum: toolList[0].uuid,
      noduleName: `nodule_${toolList[0].uuid}`,
      index: imageIndex,
    }

    noduleList.push(newNoduleList)
    setNoduleList([...noduleList])

    noduleMapList.push(newNoduleMapList)
    setNoduleMapList([...noduleMapList])

    saveResults()

    cornerstoneTools.clearToolState(cornerstoneElement, 'AddNodule')

    setTimeout(() => {
      addNodeTool(cornerstoneElement, imageIndex)
    }, 200)

    setModalVisible(false)
  }

  // 结节列表删除
  const handleDeleteNode = (e, item) => {
    e.stopPropagation()

    const noduleIndex = noduleList.findIndex(n => n.noduleNum === item.noduleNum)
    const noduleMapIndex = noduleMapList.findIndex(n => n.noduleNum === item.noduleNum)

    noduleList.splice(noduleIndex, 1)
    noduleMapList.splice(noduleMapIndex, 1)

    setNoduleList([...noduleList])
    setNoduleMapList([...noduleMapList])

    // deleteNodeData(item.noduleNum, () => {
    //   message.success(`删除结节成功`)
    // })

    deleteNodeAPI({noduleNum: item.noduleNum}).then(res => {
      // console.log('res: ', res)
      message.success(`删除结节成功`)
    }).catch(err => {
      // console.log(err)
    })

    setTimeout(() => {
      addNodeTool(cornerstoneElement, item.num)
    }, 200)
  }

  const handleCancel = e => {
    setModalVisible(false)
    handleCloseCallback()
  }

  const onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement
    const targetRect = draggleRef.current?.getBoundingClientRect()
    if (!targetRect) {
      return
    }
    setModalBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    })
  }

  // 结节总结信息保存
  const handleTextareaOnChange = suggest => {
    const seriesInfo = props.data.seriesInfo.find(item => item.active === true)
    const seriesNo = seriesInfo.seriesNo
    const studyId = seriesInfo.studyID
    // updateSeriesSuggest(suggest, studyId, seriesNo, res => {
    //   message.success(`结节总结信息添加成功 `)
    // })
    const data = {
      suggest,
      studyId,
      seriesNo
    }
    updateSuggestAPI({...data}).then(res => {
      message.success(`结节总结信息添加成功 `)
      // console.log('res: ', res)
    }).catch(err => {
      // console.log(err)
    })
  }

  // =======================================================

  const showMarkDialog = (e, cornerstoneElement) => {
    const tool = cornerstoneTools.getToolState(cornerstoneElement, 'AddNodule')
    let mark = document.getElementById('mark')
    if (tool && mark && mark.classList.contains('active')) {
      const newToolData = [...tool.data]
      const toolData = newToolData.pop()
      formatNewNodeData(toolData)
      setModalVisible(true)
    }
  }

  // 工具操作函数
  const handleCloseCallback = () => {
    const tool = cornerstoneTools.getToolState(cornerstoneElement, 'AddNodule')
    const toolData = tool.data.pop()
    cornerstoneTools.removeToolState(cornerstoneElement, 'AddNodule', toolData)
    cornerstone.updateImage(cornerstoneElement)
    setModalVisible(false)
  }

  // 监听视图变化事件
  const handleElementEnabledEvt = elementEnabledEvt => {
    const cornerstoneElement = elementEnabledEvt.detail.element
    setCornerstoneElement(cornerstoneElement)

    let toolFlag = true

    cornerstoneElement.addEventListener('cornerstonenewimage', newImage => {
      const curImageId = newImage.detail.image.imageId
      const index = nodeRef.current.imagesConfig.findIndex(item => item === curImageId)

      if (toolFlag) {
        setToolEnable()
        toolFlag = false
      }

      cornerstoneTools.setToolActive('MarkNodule', { mouseButtonMask: 1 })
      cornerstoneTools.setToolActive('StackScrollMouseWheel', {})

      setTimeout(() => {
        addNodeTool(cornerstoneElement, index)
        setActiveToolState()
      }, 0)
    })

    // cornerstoneElement.addEventListener('cornerstoneimageloaded', newImage => {
    //   console.log(1)
    // })

    // cornerstoneElement.addEventListener('cornerstoneimagerendered', imageRenderedEvent => {
    //   const curImageId = imageRenderedEvent.detail.image.imageId
    //   const index = imagesConfig.findIndex(item => item === curImageId)
    //   setCurrentImageIdIndex(index)
    // })

    cornerstoneElement.addEventListener('cornerstonetoolsmeasurementcompleted', e => {
      const tool = cornerstoneTools.getToolState(cornerstoneElement, 'AddNodule')
      if (tool) {
        showMarkDialog(e, cornerstoneElement)
      }
    })
  }

  // 调整窗宽窗位
  const windowChange = (element, image, index) => {
    /*
     * index = 1，ww: default, wl: default
     * index = 2，ww: 1500, wl: -450
     * index = 3，ww: 250, wl: 30
     * index = 4，ww: 1000, wl: 250
     * index = 5，ww: 300, wl: 40
     */
    const viewportDefault = cornerstone.getDefaultViewportForImage(element, image)
    const viewport = cornerstone.getViewport(element)
    viewport.voiLUT = undefined

    if (index === 1) {
      viewport.voi.windowWidth = viewportDefault.voi.windowWidth
      viewport.voi.windowCenter = viewportDefault.voi.windowCenter
    } else if (index === 2) {
      viewport.voi.windowWidth = 1500
      viewport.voi.windowCenter = -400
    } else if (index === 3) {
      viewport.voi.windowWidth = 250
      viewport.voi.windowCenter = 30
    } else if (index === 4) {
      viewport.voi.windowWidth = 1000
      viewport.voi.windowCenter = 250
    } else if (index === 5) {
      viewport.voi.windowWidth = 300
      viewport.voi.windowCenter = 40
    }

    cornerstone.setViewport(element, viewport)
  }

  return (
    <div className="viewer-box">
      <Toolbar
        handleExportExcel={handleExportExcel}
        handleToolbarClick={handleToolbarClick}
        setShowViewer={props.setShowViewer}
        globalData={props.data}
      />
      <div
        className="viewer-center-box"
        style={{
          height: `${size.height - 53}px`,
        }}
      >
        <LeftSidePanel patientInfo={props.data} getSelectedSeries={getSelectedSeries} />
        <ViewerMain
          handleToolbarClick={handleToolbarClick}
          handleElementEnabledEvt={handleElementEnabledEvt}
          imagesConfig={imagesConfig}
          noduleList={noduleList}
          imageIdIndex={Number(currentImageIdIndex)}
        />
        <div className="middle-box-wrap">
          <MiddleSidePanel
            data={props.data}
            noduleSuggest={noduleSuggest}
            handleCheckedListClick={handleCheckedListClick}
            onCheckChange={onCheckChange}
            handleTextareaOnChange={handleTextareaOnChange}
            handleDeleteNode={handleDeleteNode}
            noduleList={noduleList}
          />
        </div>
      </div>

      <Modal
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move',
            }}
            onMouseOver={() => {
              if (modalDisabled) {
                setModalDisabled(false)
              }
            }}
            onMouseOut={() => {
              setModalDisabled(true)
            }}
            onFocus={() => {}}
            onBlur={() => {}}
            // end
          >
            新增结节
          </div>
        }
        // maskStyle={{background: 'transparent'}}
        okText={'确定'}
        cancelText={'取消'}
        visible={modalVisible}
        maskClosable={false}
        onOk={handleOk}
        onCancel={handleCancel}
        modalRender={modal => (
          <Draggable disabled={modalDisabled} bounds={modalBounds} onStart={(event, uiData) => onStart(event, uiData)}>
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        <AddNewNode
          handleToolListTextareaChange={handleToolListTextareaChange}
          handleToolListTextareaBlur={handleToolListTextareaBlur}
          updateToolList={updateToolList}
          currentImageIdIndex={currentImageIdIndex}
          toolList={toolList}
          imagesConfig={imagesConfig}
          cornerstoneElement={cornerstoneElement}
        />
      </Modal>
    </div>
  )
}

export default Viewer
