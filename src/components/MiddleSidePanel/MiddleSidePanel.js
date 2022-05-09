import React from 'react'
import './MiddleSidePanel.scss'
// import IconFont from '../common/IconFont/index'
import { Checkbox, Button, Input, Descriptions } from 'antd'

const { TextArea } = Input

const MiddleSidePanel = (props) => {
  const handleListClick = (index, num) => {
    props.onCheckChange(index, num)
  }

  const size = 'small'

  return (
    <div className="middle-side-panel-box-wrap">
      <div className="middle-side-panel-box">
        <div className="basic-info-box">
          <div className="title">基本信息</div>
          <Descriptions size={size}>
            <Descriptions.Item label="姓名">LIU HUA</Descriptions.Item>
            <Descriptions.Item label="性别">男</Descriptions.Item>
            <Descriptions.Item label="年龄">40</Descriptions.Item>
            <Descriptions.Item label="病人ID">123123</Descriptions.Item>
            <Descriptions.Item label="检查时间">2021年12月30日</Descriptions.Item>
          </Descriptions>
        </div>
        <div className="nodule-list-box">
          <div className="title">结节列表（{props.noduleList?.length}）</div>
          <div className="table-box">
            <div className="table-title">
              <Checkbox disabled checked={true}>
                <div className="num">中心帧</div>
              </Checkbox>
              <div className="size">大小(单位mm)</div>
              <div className="type">类型</div>
              {/* <div className="risk">风险</div> */}
              <div className="soak">结节</div>
              <div className="action">状态</div>
            </div>
            <div id="tableIItemBox" className="table-content">
              {props.noduleList?.map((item, index) => (
                <div
                  key={item.id}
                  className={`table-item ${item.active ? 'item-active' : ''}`}
                  onClick={(e) => handleListClick(index, item.num)}
                >
                  {/* <div className="icon">{item.id}</div> */}
                  <Checkbox onChange={(e) => props.onCheckChange(index, item.num)} checked={item.checked}>
                    <div className="num">{item.num}</div>
                  </Checkbox>
                  <div className="size">{item.size.replace(/m/g, '')}</div>
                  <div className="type">{item.type}</div>
                  {/* <div className="risk">{item.risk}</div> */}
                  <div className="soak">
                    <span>{item.state === undefined ? '-' : item.state ? '是' : '否'}</span>
                  </div>
                  <div className="action review-state">
                    <span className={item.review ? 'review' : null}>{item.review === true ? '已检阅' : '未检阅'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="image-info-box">
          <div className="info-box">
            <div className="suggest-box">
              <div className="title">结节备注</div>
              <div className="suggest-content">
                <div className="suggest-content-wrap">
                  <TextArea
                    placeholder="请输入结节备注"
                    bordered={false}
                    rows={6}
                    maxLength={150}
                    style={{
                      width: '100%',
                      resize: 'none',
                    }}
                    value={props.noduleInfo?.suggest}
                    onChange={props.handleTextareaOnChange}
                  />
                </div>
                <div className="save">
                  <Button type="primary" size="small">
                    保存
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiddleSidePanel
