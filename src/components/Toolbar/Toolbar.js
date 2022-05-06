import React, { useState } from 'react'
import './Toolbar.scss'
import IconFont from '../common/IconFont/index'
import { Tooltip } from 'antd'

const toolbarList = [
  {
    id: 1,
    text: '自动播放',
    icon: <IconFont style={{ fontSize: '24px' }} type="icon-asmkticon0229" />,
    type: 'playClip',
    checked: false,
    filter: true,
  },
  {
    id: 2,
    text: '垂直翻转',
    icon: <IconFont style={{ fontSize: '20px' }} type="icon-fanzhuan1" />,
    type: 'vflip',
    checked: false,
    filter: true,
  },
  {
    id: 3,
    text: '水平翻转',
    icon: <IconFont style={{ fontSize: '20px' }} type="icon-fanzhuan" />,
    type: 'hflip',
    checked: false,
    filter: true,
  },
  {
    id: 4,
    text: '放大',
    icon: <IconFont style={{ fontSize: '26px' }} type="icon-fangda" />,
    type: 'Magnify',
    checked: false,
  },
  // {
  //   id: 5,
  //   text: '聚焦',
  //   icon: <IconFont style={{ fontSize: '24px' }} type="icon-jujiao" />,
  //   type: 'focus',
  //   checked: false,
  // },
  {
    id: 6,
    type: 'hr',
  },
  {
    id: 7,
    text: '圆形',
    icon: <IconFont style={{ fontSize: '24px' }} type="icon-yuanxing" />,
    type: 'EllipticalRoi',
    checked: false,
  },
  {
    id: 8,
    text: '矩形',
    icon: <IconFont style={{ fontSize: '24px' }} type="icon-juxing" />,
    type: 'RectangleRoi',
    checked: false,
  },
  {
    id: 9,
    text: '角度选择',
    icon: <IconFont style={{ fontSize: '18px' }} type="icon-jiaoduceliang" />,
    type: 'Angle',
    checked: false,
  },
  {
    id: 10,
    text: '尺子',
    icon: <IconFont style={{ fontSize: '22px' }} type="icon-02-chizi" />,
    type: 'Length',
    checked: false,
  },
  {
    id: 11,
    text: '清除',
    icon: <IconFont style={{ fontSize: '18px' }} type="icon-qingchuhuancun" />,
    type: 'Eraser',
    checked: false,
  },
  // {
  //   id: 12,
  //   text: '标记',
  //   icon: <IconFont style={{ fontSize: '20px' }} type="icon-shizi-" />,
  //   type: 'MarkNodule',
  //   checked: false,
  // },
]

const Toolbar = props => {
  const [state, setstate] = useState(toolbarList)

  const handleToolbarClick = (e, index, type) => {
    if (type === 'playClip' || type === 'vflip' || type === 'hflip') {
      state[index].checked = !state[index].checked
      setstate([...state])
    } else {
      state[index].checked = !state[index].checked
      state.map(item => {
        if (item.type !== type && item.type !== 'playClip' && item.type !== 'vflip' && item.type !== 'hflip')
          item.checked = false
      })
      setstate([...state])
    }

    // 父组件传值
    props.handleToolbarClick(type, state[index].checked)
  }

  return (
    <ul className="tool-bar-box">
      {toolbarList.map((item, index) => {
        return item.type === 'hr' ? (
          <li key={item.id} className="hr">
            <div></div>
          </li>
        ) : (
          <li
            id={item.type === 'MarkNodule' && item.checked ? 'mark' : null}
            key={item.id}
            className={item.checked ? (item.filter ? 'filter-active' : 'active') : ''}
            onClick={e => handleToolbarClick(e, index, item.type)}
            data-type={item.type}
          >
            <Tooltip title={item.text}>{item.icon}</Tooltip>
          </li>
        )
      })}
    </ul>
  )
}

export default Toolbar
