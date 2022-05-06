import React from 'react'
import CornerstoneViewport from 'react-cornerstone-viewport'
import './ViewerMain.scss'
import useWindowSize from '../../hook/useWindowSize'

import CustomOverlay from '../common/CustomOverlay/CustomOverlay'
import { Spin } from 'antd'

const ViewerMain = props => {
  const size = useWindowSize()
  return (
    <div className="viewer-main-box">
      {props.imagesConfig.length === 0 ? (
        <div className="error-tips">
          <Spin tip="加载失败，请重新尝试" />
        </div>
      ) : (
        <div>
          <CornerstoneViewport
            imageIdIndex={props.imageIdIndex}
            viewportOverlayComponent={CustomOverlay}
            onElementEnabled={elementEnabledEvt => props.handleElementEnabledEvt(elementEnabledEvt)}
            tools={props.toolsConfig}
            imageIds={props.imagesConfig}
            style={{
              minWidth: '100%',
              height: props.pageType === 'detail' ? `${size.height}px` : `${size.height - 85}px`,
              flex: '1',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ViewerMain
