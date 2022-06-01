import React from 'react'
import CornerstoneViewport from 'react-cornerstone-viewport'
import './ViewerMain.scss'
import useWindowSize from '../../hook/useWindowSize'
import CustomOverlay from '../common/CustomOverlay/CustomOverlay'

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

export default ViewerMain
