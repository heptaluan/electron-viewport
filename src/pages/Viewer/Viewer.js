import React, { useState, useEffect } from 'react'
import './Viewer.scss'
import LeftSidePanel from '../../components/LeftSidePanel/LeftSidePanel'
import ViewerMain from '../../components/ViewerMain/ViewerMain'
import cornerstone from 'cornerstone-core'
import cornerstoneTools from 'cornerstone-tools'
import Toolbar from '../../components/Toolbar/Toolbar'

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
  const [cornerstoneElement, setCornerstoneElement] = useState(null)
  const [toolsConfig, setToolsConfig] = useState(defaultTools)
  const [imagesConfig, setImagesConfig] = useState([
    // 'wadouri:http://im.ananpan.com/omics/image/CHENSHUHUA/20211230/IMG00230.dcm'
  ])
  const [sequenceListData, setLeftSidePanelData] = useState([])

  // ===========================================================

  useEffect(() => {
    // setImagesConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // 监听视图变化事件
  const handleElementEnabledEvt = elementEnabledEvt => {
    const cornerstoneElement = elementEnabledEvt.detail.element
    setCornerstoneElement(cornerstoneElement)

    cornerstoneElement.addEventListener('cornerstonenewimage', newImage => {
      // const curImageId = newImage.detail.image.imageId
      // const index = imagesConfig.findIndex(item => item === curImageId)

      cornerstoneTools.setToolActive('MarkNodule', { mouseButtonMask: 1 })
      setTimeout(() => {
        windowChange(cornerstoneElement, newImage.detail.image, 2)
        setActiveToolState()
      }, 0)
    })

    // cornerstoneElement.addEventListener('cornerstoneimageloaded', newImage => {
    //   console.log(1)
    // })

    cornerstoneElement.addEventListener('cornerstoneimagerendered', imageRenderedEvent => {
      // const curImageId = imageRenderedEvent.detail.image.imageId
      // const index = imagesConfig.findIndex(item => item === curImageId)
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

  // ===========================================================


  return (
    <div className="viewer-box">
      <Toolbar handleToolbarClick={handleToolbarClick} />
      <div className="viewer-center-box">
        <LeftSidePanel data={sequenceListData} />
        <ViewerMain
          handleToolbarClick={handleToolbarClick}
          handleElementEnabledEvt={handleElementEnabledEvt}
          toolsConfig={toolsConfig}
          imagesConfig={imagesConfig}
        />
      </div>
    </div>
  )
}

export default Viewer
