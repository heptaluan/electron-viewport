import React, { useState, useEffect, useRef } from 'react'
import './Viewer.scss'
import Header from '../../components/Header/Header'
// import LeftSidePanel from '../../components/LeftSidePanel/LeftSidePanel'
import ViewerMain from '../../components/ViewerMain/ViewerMain'
import MiddleSidePanel from '../../components/MiddleSidePanel/MiddleSidePanel'
import cornerstone from 'cornerstone-core'
import cornerstoneTools from 'cornerstone-tools'
import NoduleInfo from '../../components/common/NoduleInfo/NoduleInfo'
import MarkNoduleTool from '../../components/common/MarkNoduleTool/MarkNoduleTool'
import MarkDialog from '../../components/common/MarkDialog/MarkDialog'
import { saveDnResult, getImageList, getNodeList, updateDnResult, getPatientsList, getDoctorTask } from '../../api/api'
import { getURLParameters } from '../../util/index'
import { Modal, message, Button } from 'antd'

const Viewer = () => {
  const defaultTools = [
    {
      name: 'Wwwc',
      mode: 'active',
      modeOptions: { mouseButtonMask: 1 },
    },
    { name: 'StackScrollMouseWheel', mode: 'active' },
    {
      name: 'RectangleRoi',
      modeOptions: { mouseButtonMask: 1 },
    },
    {
      name: 'Eraser',
      modeOptions: { mouseButtonMask: 1 },
    },
    {
      name: 'Magnify',
      modeOptions: { mouseButtonMask: 1 },
    },
    {
      name: 'EllipticalRoi',
      modeOptions: { mouseButtonMask: 1 },
    },
    {
      name: 'Angle',
      modeOptions: { mouseButtonMask: 1 },
    },
    {
      name: 'Length',
      modeOptions: { mouseButtonMask: 1 },
    },
  ]

  // 初始化
  // eslint-disable-next-line no-unused-vars
  const [toolsConfig, setToolsConfig] = useState(defaultTools)
  const [imagesConfig, setImagesConfig] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [taskLength, setTaskLength] = useState(0)
  // eslint-disable-next-line no-unused-vars
  const [sequenceListData, setLeftSidePanelData] = useState([])
  const [noduleList, setNoduleList] = useState([])
  const [originNoduleList, setOriginNoduleList] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [patients, setPatients] = useState([])
  const [noduleMapList, setNoduleMapList] = useState([])

  // 结节详情
  const [noduleInfo, setNoduleInfo] = useState(null)

  // 页面类型和状态
  const [pageType, setPageType] = useState('')
  const [pageState, setPageState] = useState('')

  // 跳转帧数
  const [imageIdIndex, setImageIdIndex] = useState(0)

  // 初始化结节信息
  useEffect(() => {
    // 管理员请求接口
    const fetchAdminData = async () => {
      const result = await getNodeList(getURLParameters(window.location.href).id)
      if (result.data.code === 200) {
        if (result.data.result) {
          const data = JSON.parse(result.data.result.text.replace(/'/g, '"'))
          formatNodeData(data, [])
          fetcImagehData(data.detectionResult.nodulesList)
        }
      }
    }

    // 医生请求接口
    const fetchDoctorData = async () => {
      const result = await getDoctorTask(getURLParameters(window.location.href).doctorId)
      if (result.data.code === 200) {
        if (result.data.result) {
          if (result.data.result.doctorTask.resultInfo) {
            const data = JSON.parse(result.data.result.imageResult.replace(/'/g, '"'))
            const resultInfo = JSON.parse(result.data.result.doctorTask.resultInfo.replace(/'/g, '"'))
            formatNodeData(data, resultInfo.nodelist)
            fetcImagehData(data.detectionResult.nodulesList)
          } else {
            const data = JSON.parse(result.data.result.imageResult.replace(/'/g, '"'))
            formatNodeData(data, [])
            fetcImagehData(data.detectionResult.nodulesList)
          }
        }
      }
    }

    const fetcImagehData = async data => {
      const res = await getImageList(getURLParameters(window.location.href).resource)
      setImageList(res, data)
    }

    if (getURLParameters(window.location.href).user === 'admin') {
      fetchAdminData()
    } else if (!getURLParameters(window.location.href).user) {
      fetcImagehData(null)
    } else {
      fetchDoctorData()
    }

    if (getURLParameters(window.location.href).state === 'admin') {
      setPageState('admin')
    }

    if (getURLParameters(window.location.href).page === 'review') {
      setPageType('review')
    } else if (getURLParameters(window.location.href).page === 'image') {
      setPageType('image')
    } else if (getURLParameters(window.location.href).page === 'detail') {
      setPageType('detail')
      const index = getURLParameters(window.location.href).index
      if (index) {
        setImageIdIndex(Number(index))
      } else {
        setImageIdIndex(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 初始化影像信息
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 初始化病人信息
  useEffect(() => {
    const fetchData = async () => {
      const result = await getPatientsList(getURLParameters(window.location.href).resource)
      // console.log(result)
      if (result.data.code === 200 && result.data.result) {
        setPatients(result.data.result.records[0])
      }
    }
    if (getURLParameters(window.location.href).page === 'image') {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 多选
  const [indeterminate, setIndeterminate] = useState(false)
  const [checkAll, setCheckAll] = useState(true)

  // 视图元素
  const [cornerstoneElement, setCornerstoneElement] = useState(null)

  // 弹出层
  const [showPopover, setShowPopover] = useState({
    index: 0,
    visible: false,
  })

  // ===========================================================

  // 添加结节标注
  const addNodeTool = (cornerstoneElement, index = 0) => {
    const item = noduleMapList.filter(item => item.index === index + 1)
    const checkItme = noduleList.find(item => item.checked === true)

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
                x: item[i].startX - 10,
                y: item[i].startY - 10,
                highlight: true,
                active: true,
              },
              end: {
                x: item[i].endX + 10,
                y: item[i].endY + 10,
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
                x: item[i].startX - 10,
                y: item[i].startY - 10,
                highlight: true,
                active: true,
              },
              end: {
                x: item[i].endX + 10,
                y: item[i].endY + 10,
                highlight: true,
                active: true,
              },
            },
          }
          cornerstoneTools.addToolState(cornerstoneElement, 'MarkNodule', measurementData)
        }
      }
      cornerstone.updateImage(cornerstoneElement)
    }
  }

  // 设置图片列表
  const setImageList = (res, data) => {
    if (res.data.code === 200 && res.data.result.length > 0) {
      const newList = res.data.result
      const imageList = []
      newList.forEach(item => {
        imageList.push(`wadouri:${item.ossUrl.replace('http://', 'https://')}`)
      })

      setImagesConfig(imageList)

      // 缓存图片
      if (data && data.length > 0) {
        loadAndCacheImage(cornerstone, imageList, data)
      }
    }
  }

  // ===========================================================

  // 单选
  const onCheckChange = (index, num) => {
    handleCheckedListClick(num)
    noduleList.map(item => (item.checked = false))
    noduleList[index].checked = true
    setNoduleList([...noduleList])
    if (noduleList.every(item => item.checked === true)) {
      setIndeterminate(false)
      setCheckAll(true)
    } else {
      setIndeterminate(true)
      setCheckAll(false)
    }

    const checkItme = noduleList.find(item => item.checked === true)
    if (checkItme && pageType !== 'detail') {
      setNoduleInfo(checkItme)
    } else {
      setNoduleInfo(null)
    }
  }

  // 全选
  const onCheckAllChange = e => {
    setCheckAll(e.target.checked)
    if (e.target.checked) {
      noduleList.map(item => (item.checked = true))
      setNoduleList([...noduleList])
    } else {
      noduleList.map(item => (item.checked = false))
      setNoduleList([...noduleList])
    }
  }

  // 弹出层按钮事件
  const handleHideNodule = (e, id) => {
    // noduleList.splice(
    //   noduleList.findIndex(item => item.id === id),
    //   1
    // )
    // setNoduleList([...noduleList])
    // setShowPopover({
    //   visible: false,
    //   index: 0,
    // })
  }

  // 列表点击事件
  const handleCheckedListClick = index => {
    // const item = noduleList.find(item => Number(item.num) === index + 1)
    // if (item) {
    //   noduleList.map(item => (item.active = false))
    //   item.active = true
    //   setNoduleList([...noduleList])
    //   setTimeout(() => {
    //     const viewerItemActive = document.querySelector('#viewerItemBox .item-active')
    //     viewerItemActive && viewerItemActive.scrollIntoView()
    //   }, 0)
    // }

    // 设置当前视图选中项
    if (cornerstoneElement) {
      changeActiveImage(index, cornerstoneElement)
    }
  }

  // 更新列表事件
  const updateNoduleList = checkState => {
    const checkItme = noduleList.find(item => item.checked === true)
    checkItme.review = true
    checkItme.state = checkState
    setNoduleList([...noduleList])

    // 提交结节数据
    saveResults()
  }

  // 更新结节事件
  const checkNoduleList = (val, type) => {
    const checkItme = noduleList.find(item => item.checked === true)
    if (checkItme && type === 'lung') {
      checkItme.lung = val
      checkItme.review = true
    }
    if (checkItme && type === 'lobe') {
      checkItme.lobe = val
      checkItme.review = true
    }
    if (checkItme && type === 'type') {
      checkItme.type = val
      checkItme.review = true
    }
    setNoduleList([...noduleList])

    // 提交结节数据
    saveResults()
  }

  // 更新医生影像建议内容
  const handleTextareaOnChange = e => {
    const checkItme = noduleList.find(item => item.checked === true)
    if (checkItme) {
      checkItme.suggest = e.target.value
      setNoduleList([...noduleList])
    }
  }

  // 建议框失去焦点后保存数据
  const handleInputBlur = e => {
    const checkItme = noduleList.find(item => item.checked === true)
    if (checkItme) {
      checkItme.suggest = e.target.value
      setNoduleList([...noduleList])
    }

    // 提交结节数据
    saveResults()
  }

  // 列表右侧操作菜单
  const handleVisibleChange = (visible, index) => {
    if (visible) {
      setShowPopover({
        visible: visible,
        index: index,
      })
    } else {
      setShowPopover({
        visible: visible,
        index: 0,
      })
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
      default:
        break
    }
  }

  // 切换当前视图
  const changeActiveImage = (index, cornerstoneElement) => {
    cornerstone.loadImage(imagesConfig[index]).then(image => {
      cornerstone.displayImage(cornerstoneElement, image)
      cornerstoneTools.addStackStateManager(cornerstoneElement, ['stack'])
      cornerstoneTools.addToolState(cornerstoneElement, 'stack', {
        currentImageIdIndex: Number(index),
        imageIds: imagesConfig,
      })
    })
  }

  // 工具回调
  const [showMark, setShowMark] = useState(false)
  const showMarkDialog = (e, cornerstoneElement) => {
    const tool = cornerstoneTools.getToolState(cornerstoneElement, 'MarkNodule')
    let mark = document.getElementById('mark')
    if (tool && mark && mark.classList.contains('active')) {
      console.log(tool)
      setShowMark(true)
    }
  }

  // 工具操作函数
  const handleCloseCallback = () => {
    const tool = cornerstoneTools.getToolState(cornerstoneElement, 'MarkNodule')
    const toolData = tool.data.pop()
    cornerstoneTools.removeToolState(cornerstoneElement, 'MarkNodule', toolData)
    cornerstone.updateImage(cornerstoneElement)
    setShowMark(false)
  }

  const handleSubmitCallback = value => {
    const tool = cornerstoneTools.getToolState(cornerstoneElement, 'MarkNodule')

    if (tool) {
      const toolData = tool.data.pop()
      const measurementData = {
        visible: true,
        active: false,
        color: undefined,
        invalidated: true,
        handles: {
          start: {
            x: toolData.handles.start.x,
            y: toolData.handles.start.y,
            highlight: true,
            active: false,
          },
          end: {
            x: toolData.handles.end.x,
            y: toolData.handles.end.y,
            highlight: true,
            active: true,
          },
        },
      }
      cornerstoneTools.clearToolState(cornerstoneElement, 'MarkNodule')
      cornerstoneTools.addToolState(cornerstoneElement, 'MarkNodule', measurementData)
      cornerstone.updateImage(cornerstoneElement)
      setShowMark(false)
    }
  }

  // 监听视图变化事件
  const handleElementEnabledEvt = elementEnabledEvt => {
    const cornerstoneElement = elementEnabledEvt.detail.element
    setCornerstoneElement(cornerstoneElement)
    cornerstoneTools.addTool(MarkNoduleTool)

    cornerstoneElement.addEventListener('cornerstonenewimage', newImage => {
      const curImageId = newImage.detail.image.imageId
      const index = imagesConfig.findIndex(item => item === curImageId)

      cornerstoneTools.setToolActive('MarkNodule', { mouseButtonMask: 1 })
      setTimeout(() => {
        windowChange(cornerstoneElement, newImage.detail.image, 2)
        addNodeTool(cornerstoneElement, index)
        setActiveToolState()
      }, 0)
    })

    // cornerstoneElement.addEventListener('cornerstoneimageloaded', newImage => {
    //   console.log(1)
    // })

    cornerstoneElement.addEventListener('cornerstoneimagerendered', imageRenderedEvent => {
      const curImageId = imageRenderedEvent.detail.image.imageId
      const index = imagesConfig.findIndex(item => item === curImageId)
      handleCheckedListClick(index)
    })

    cornerstoneElement.addEventListener('cornerstonetoolsmouseup', e => {
      if (localStorage.getItem('active') === 'true') {
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

  // ===========================================================

  // 保存为图片
  // const saveAs = (element, filename, mimetype = 'image/png') => {
  //   const canvas = element.querySelector('canvas')
  //   if (canvas.msToBlob) {
  //     const blob = canvas.msToBlob()

  //     return window.navigator.msSaveBlob(blob, filename)
  //   }

  //   const lnk = document.createElement('a')
  //   lnk.download = filename
  //   lnk.href = canvas.toDataURL(mimetype, 1)

  //   if (document.createEvent) {
  //     const e = document.createEvent('MouseEvents')
  //     e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  //     lnk.dispatchEvent(e)
  //   } else if (lnk.fireEvent) {
  //     lnk.fireEvent('onclick')
  //   }
  // }

  // 格式化结节数据
  const formatNodeData = (data, resultInfo) => {
    const nodulesList = []
    const nodulesMapList = []
    let index = 0
    if (data.code === 10000) {
      setOriginNoduleList([...data.detectionResult.nodulesList])
      const res = data.detectionResult.nodulesList
      // const res = data.detectionResult.nodulesList.sort(nestedSort('coord', 'coordZ'))
      for (let i = 0; i < res.length; i++) {
        nodulesList.push({
          id: index,
          num: res[i].coord.coordZ,
          size: res[i].diameter,
          type: resultInfo[i] ? resultInfo[i].featureLabel : res[i].featureLabel.value,
          risk: (res[i].scrynMaligant * 100).toFixed(0) + '%',
          soak: '',
          info: '',
          checked: false,
          active: false,
          noduleName: res[i].noduleName,
          noduleNum: res[i].noduleNum,
          state:
            resultInfo[i] && Number(resultInfo[i].invisable) === 1
              ? false
              : resultInfo[i] && Number(resultInfo[i].invisable) === 0
              ? true
              : undefined,
          review: resultInfo[i] ? resultInfo[i].edit : false,
          lung: resultInfo[i] ? resultInfo[i].lungLocation : res[i].lobe.lungLocation,
          lobe: resultInfo[i] ? resultInfo[i].lobeLocation : res[i].lobe.lobeLocation,
          noduleSize: res[i].noduleSize,
          featureLabelG: res[i].featureLabelG,
          suggest: resultInfo[i] ? resultInfo[i].suggest : '',
        })
        index++
      }

      for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].rois.length; j++) {
          const rois = res[i].rois[j]
          nodulesMapList.push({
            noduleName: res[i].noduleName,
            index: Number(rois.key),
            startX: rois.bbox[1],
            startY: rois.bbox[0],
            endX: rois.bbox[3],
            endY: rois.bbox[2],
          })
        }
      }
      setNoduleList(nodulesList)
      setNoduleMapList(nodulesMapList)
    } else {
      setNoduleList([])
      console.log(`数据加载失败`)
    }
  }

  // 缓存图片请求池
  const loadAndCacheImage = (cornerstone, imageList, data) => {
    try {
      const coordZList = []
      for (let i = 0; i < data.length; i++) {
        coordZList.push(data[i].coord.coordZ)
      }

      let filterArr = []
      for (let i = 0; i < coordZList.length; i++) {
        var pre = coordZList[i] - 5 > 0 ? coordZList[i] - 5 : 0
        for (let j = 0; j < 10; j++) {
          filterArr.push(pre + j)
        }
      }

      filterArr = [...new Set(filterArr)]
      const newImageList = []
      for (let i = 0; i < filterArr.length; i++) {
        newImageList.push(imageList[filterArr[i]])
      }

      for (let i = 0; i < newImageList.length; i++) {
        cornerstone.loadAndCacheImage(newImageList[i])
      }
    } catch (error) {
      console.log(error)
    }
  }

  // ===========================================================

  const [showState, setShowState] = useState(false)

  // 隐藏和显示结节列表
  const showNoduleList = () => {
    console.log(showState)
    setShowState(!showState)
  }

  // ===========================================================

  const [visible, setVisible] = useState(false)

  const hideModal = () => {
    setVisible(false)
  }

  // 弹窗
  const handleShowModal = () => {
    if (noduleList.every(item => item.review === true)) {
      setVisible(true)
    } else {
      message.warning(`请检阅完所有结节列表后在进行结果提交`)
    }
  }

  // 获取当前时间
  const getCurrentTime = () => {
    let yy = new Date().getFullYear()
    let mm = new Date().getMonth() + 1
    let dd = new Date().getDate()
    let hh = new Date().getHours()
    let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
    let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds()
    return yy + '-' + mm + '-' + dd + ' ' + hh + ':' + mf + ':' + ss
  }

  // 格式化提交数据
  const formatPostData = () => {
    const postData = {
      id:
        getURLParameters(window.location.href).user === 'admin'
          ? getURLParameters(window.location.href).taskId
          : getURLParameters(window.location.href).doctorId,
      resultInfo: {
        nodelist: [],
      },
    }

    for (let i = 0; i < noduleList.length; i++) {
      postData.resultInfo.nodelist.push({
        index: originNoduleList.findIndex(item => item.noduleNum === noduleList[i].noduleNum) + 1,
        imageIndex: noduleList[i].num,
        lungLocation: noduleList[i].lung,
        lobeLocation: noduleList[i].lobe,
        featureLabel: noduleList[i].type,
        edit_time: getCurrentTime(),
        edit: noduleList[i].review,
        suggest: noduleList[i].suggest,
        invisable: noduleList[i].state === false ? '1' : noduleList[i].state === true ? '0' : '-',
      })
    }

    postData.resultInfo = JSON.stringify(postData.resultInfo)

    return postData
  }

  // 暂存结节数据
  const saveResults = () => {
    const postData = formatPostData()
    saveDnResult(JSON.stringify(postData)).then(res => {
      if (res.data.code === 200) {
        message.success(`结节结果保存成功`)
      } else {
        message.error(`结节结果保存失败，请重新尝试`)
      }
    })
  }

  // 提交审核结果
  const handleSubmitResults = () => {
    const postData = formatPostData()
    console.log(postData)
    updateDnResult(JSON.stringify(postData)).then(res => {
      console.log(res)
      if (res.data.code === 200) {
        message.success(`提交审核结果成功`)
        setVisible(false)
        setTimeout(() => {
          window.parent.postMessage(
            {
              code: 200,
              success: true,
              backId: getURLParameters(window.location.href).backId,
              backType: getURLParameters(window.location.href).backType,
            },
            '*'
          )
        }, 1000)
      } else {
        message.error(`提交失败，请刷新后重新尝试`)
      }
    })
  }

  return (
    <div className={pageType ? `viewer-${pageType}-box` : 'viewer-box'}>
      {/* {taskLength !== imagesConfig.length ? (
        <div className="load-image-mask">
          <span>图片序列加载中 {taskLength > 0 ? <em>，正在加载第 {taskLength} 张</em> : null}</span>
        </div>
      ) : null} */}
      <Header data={patients} handleShowModal={handleShowModal} pageType={pageType} pageState={pageState} />
      <div className="viewer-center-box">
        {/* <LeftSidePanel data={sequenceListData} handleSequenceListClick={handleSequenceListClick} /> */}
        <div className={showState ? 'middle-box-wrap-show' : 'middle-box-wrap-hide'}>
          <MiddleSidePanel
            handleVisibleChange={handleVisibleChange}
            handleCheckedListClick={handleCheckedListClick}
            handleHideNodule={handleHideNodule}
            onCheckChange={onCheckChange}
            onCheckAllChange={onCheckAllChange}
            showPopover={showPopover}
            indeterminate={indeterminate}
            checkAll={checkAll}
            noduleList={noduleList}
            noduleInfo={noduleInfo}
          />
        </div>
        <ViewerMain
          handleToolbarClick={handleToolbarClick}
          handleElementEnabledEvt={handleElementEnabledEvt}
          toolsConfig={toolsConfig}
          imagesConfig={imagesConfig}
          noduleList={noduleList}
          pageType={pageType}
          imageIdIndex={imageIdIndex}
        />
      </div>
      <NoduleInfo
        noduleInfo={noduleInfo}
        handleTextareaOnChange={handleTextareaOnChange}
        handleInputBlur={handleInputBlur}
        checkNoduleList={checkNoduleList}
        updateNoduleList={updateNoduleList}
        pageState={pageState}
      />
      {showMark ? (
        <MarkDialog handleCloseCallback={handleCloseCallback} handleSubmitCallback={handleSubmitCallback} />
      ) : null}

      <Modal
        title="提交审核结果"
        maskClosable={false}
        visible={visible}
        onOk={handleSubmitResults}
        onCancel={hideModal}
        okText="确认"
        cancelText="取消"
        maskStyle={{ backgroundColor: 'transparent' }}
      >
        <p>是否提交检阅结果</p>
      </Modal>

      {pageType === 'review' ? (
        <div className="show-button">
          <Button onClick={showNoduleList}>{showState ? '展开结节列表' : '收起结节列表'}</Button>
          {getURLParameters(window.location.href).patientId &&
          getURLParameters(window.location.href).patientId !== 'null' ? (
            <span className="infor-detail">
              patientId: <em>{getURLParameters(window.location.href).patientId}</em>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Viewer
