import React, { useState, useEffect } from 'react'

import './LeftSidePanel.scss'
import { Tag } from 'antd'
import { ViewerThumbnail } from '../ViewerMain/ViewerMain'

const LeftSidePanel = props => {
  const [thumbnailList, setThumbnailList] = useState([])
  useEffect(() => {
    let tempList = [...props.patientInfo.seriesInfo]
    setThumbnailList(tempList)
  }, [props.patientInfo.seriesInfo])

  const methods = {
    changeActive(item) {
      thumbnailList?.map((res, index) => {
        res.active = false
      })
      item.active = true
      props.getSelectedSeries(item)
      setThumbnailList([...thumbnailList])
    },
  }

  return (
    <div className="left-side-panel-box">
      <div className="list-box-wrap">
        <div className="list-box">
          {thumbnailList?.length === 0 ? (
            <div className="empty">暂无序列</div>
          ) : (
            thumbnailList?.map((item, index) => (
              <div
                key={item.key}
                onClick={e => {
                  methods.changeActive(item, index)
                }}
                className={item.active ? 'active list-item' : 'list-item'}
              >
                <div className="title">序列：{item.seriesDescription}</div>
                <div className="img-box">
                  <ViewerThumbnail imageId={item.cover} imageIdIndex={Number(item.seriesNo)} />
                  <div className="sequence-num">
                    <Tag color="orange">{item.frameNum} 帧</Tag>
                  </div>
                </div>
                <div className="list-detail">{item['acquisitionDate']}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LeftSidePanel
