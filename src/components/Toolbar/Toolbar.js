import React, { useState } from 'react'
import './Toolbar.scss'
import IconFont from '../common/IconFont/index'
import { Tooltip, Button, Modal } from 'antd'
import ModalContent from '../ModalContent/ModalContent'

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
  // {
  //   id: 8,
  //   text: '矩形',
  //   icon: <IconFont style={{ fontSize: '24px' }} type="icon-juxing" />,
  //   type: 'RectangleRoi',
  //   checked: false,
  // },
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
    id: 17,
    text: '矩形',
    icon: <IconFont style={{ fontSize: '24px' }} type="icon-juxing" />,
    type: 'RectangleRoi',
    checked: false,
  },
  {
    id: 11,
    text: '缩放',
    icon: <IconFont style={{ fontSize: '18px' }} type="icon-zoom" />,
    type: 'Zoom',
    checked: false,
  },
  {
    id: 12,
    text: '平移',
    icon: <IconFont style={{ fontSize: '18px' }} type="icon-move" />,
    type: 'Pan',
    checked: false,
  },
  {
    id: 13,
    type: 'hr',
  },
  {
    id: 14,
    text: '复原图像',
    icon: <IconFont style={{ fontSize: '18px' }} type="icon-reset_defalut" />,
    type: 'Reset',
    checked: false,
  },
  {
    id: 15,
    text: '清除标注',
    icon: <IconFont style={{ fontSize: '18px' }} type="icon-qingchuhuancun" />,
    type: 'Eraser',
    checked: false,
  },
  {
    id: 16,
    type: 'hr',
  },
  {
    id: 18,
    text: '结节标注',
    icon: <IconFont style={{ fontSize: '20px' }} type="icon-juxing" />,
    type: 'AddNodule',
    checked: false,
  },
]

const Toolbar = props => {
  const [visible, setVisible] = useState(false)
  const [state, setstate] = useState(toolbarList)

  const handleToolbarClick = (e, index, type) => {
    if (type === 'playClip' || type === 'vflip' || type === 'hflip') {
      state[index].checked = !state[index].checked
      setstate([...state])
    } else if (type === 'Reset') {
      props.handleToolbarClick(type, state[index].checked)
      state.map(item => {
        if (item.type === 'vflip' || item.type === 'hflip') item.checked = false
      })
      setstate([...state])
      return
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
    <ul className="tool-bar-wrap">
      <div className="tool-bar-box">
        <div className="back-btn" onClick={() => props.setShowViewer(false)}>
          <IconFont style={{ fontSize: '24px' }} type="icon-back" />
        </div>
        <div className="tool-bar">
          {toolbarList.map((item, index) => {
            return item.type === 'hr' ? (
              <li key={item.id} className="hr">
                <div></div>
              </li>
            ) : (
              <li
                id={item.type === 'AddNodule' && item.checked ? 'mark' : null}
                key={item.id}
                className={item.checked ? (item.filter ? 'filter-active' : 'active') : ''}
                onClick={e => handleToolbarClick(e, index, item.type)}
                data-type={item.type}
              >
                <Tooltip title={item.text}>{item.icon}</Tooltip>
              </li>
            )
          })}
        </div>
      </div>
      <div className="show-modal">
        <Button onClick={props.handleExportExcel} style={{ marginRight: 15 }}>
          导出结节信息
        </Button>
        <Button onClick={() => setVisible(true)}>查看头信息</Button>
      </div>

      <Modal
        title="DICOM信息"
        centered
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        destroyOnClose={true}
        width={600}
        footer={null}
      >
        <ModalContent globalData={props.globalData} />
      </Modal>
    </ul>
  )
}

export default Toolbar
