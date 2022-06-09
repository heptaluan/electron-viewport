import React, { useState, useEffect, createRef } from 'react'
import CornerstoneViewport from 'react-cornerstone-viewport'
import './ViewerMain.scss'
import cornerstone from 'cornerstone-core'
import useWindowSize from '../../hook/useWindowSize'
import CustomOverlay from '../common/CustomOverlay/CustomOverlay'
import { showImageByDCMID } from '../../util/index'

const ViewerMain = props => {
  const size = useWindowSize()
  return (
    <div className="viewer-main-box">
      <CornerstoneViewport
        imageIdIndex={props.imageIdIndex}
        viewportOverlayComponent={CustomOverlay}
        onElementEnabled={elementEnabledEvt => props.handleElementEnabledEvt(elementEnabledEvt)}
        imageIds={props.imagesConfig}
        style={{
          minWidth: '100%',
          height: `${size.height - 70}px`,
          flex: '1',
        }}
      />
    </div>
  )
}

export const ViewerThumbnail = props => {
  const { imageId, imageIdIndex } = props
  const canvasRef = createRef()
  const [isLoading, setLoading] = useState(false)
  const [image, setImage] = useState({})

  useEffect(() => {
    if (image.imageId) {
      cornerstone.renderToCanvas(canvasRef.current, image)
      setLoading(false)
    }
  }, [canvasRef, image, image.imageId])

  useEffect(() => {
    // console.log('imageId：', imageId, ', image: ', image)
    if (!image.imageId || image.imageId !== imageId) {
      setLoading(true)
      showImageByDCMID(imageId)
        .then(res => {
          setImage(res)
        })
        .catch(err => {
          console.log('err: ', err)
        })
    }
  }, [image.imageId, imageId])

  // console.log('imageIdIndex: ', props.imageIdIndex)
  // console.log('props:', props)
  return (
    <div>
      <div className="image-thumbnail-canvas">
        <canvas
          ref={canvasRef}
          style={{
            minWidth: '100%',
            minHeight: '120px',
            flex: '1',
          }}
        />
        {isLoading && <div className="image-thumbnail-loading-indicator"></div>}
      </div>
    </div>
  )
}

export default ViewerMain
