import React from 'react'
import './CustomOverlay.scss'

const CustomOverlay = props => {
  return (
    <ul className="custom-overlay-box">
      <li>
        当前帧数：<span>{props.imageIndex - 1}</span>
      </li>
      <li>
        总帧数：<span>{props.stackSize}</span>
      </li>
      <li>
        窗宽：<span>{props.windowWidth} HU</span>
      </li>
      <li>
        窗位：<span>{props.windowCenter} HU</span>
      </li>
    </ul>
  )
}

export default CustomOverlay
