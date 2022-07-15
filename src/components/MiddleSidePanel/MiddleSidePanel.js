import React, { useState, createRef, useEffect } from 'react'
import './MiddleSidePanel.scss'
import { Checkbox, Button, Input, Descriptions, Popconfirm  } from 'antd'

const { TextArea } = Input

const MiddleSidePanel = props => {
  const handleListClick = (index, num) => {
    props.onCheckChange(index, num)
  }

  const [suggest, setSuggest] = useState('')

  const textAreaRef = createRef()

  const size = 'small'

  useEffect(() => {
    setSuggest(props.noduleSuggest)
  }, [props.noduleSuggest])

  const handleSave = () => {
    props.handleTextareaOnChange(suggest)
    // textAreaRef.current.blur()
  }

  return (
    <div className="middle-side-panel-box-wrap">
      <div className="middle-side-panel-box">
        <div className="basic-info-box">
          <div className="title">基本信息</div>
          <Descriptions column={1} size={size}>
            <Descriptions.Item label="姓名">{props.data.patientName}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {props.data.patientGender === '**'
                ? props.data.patientGender
                : props.data.patientGender === 'M'
                ? '男'
                : '女'}
            </Descriptions.Item>
            <Descriptions.Item label="年龄">
              {props.data.patientBirthday && props.data.patientBirthday.toString().slice(0, 2) > 18
                ? new Date().getFullYear() - Number(props.data.patientBirthday.toString().slice(0, 4))
                : '**'}
            </Descriptions.Item>
            <Descriptions.Item label="病人ID">{props.data.patientID}</Descriptions.Item>
            <Descriptions.Item label="检查时间">{props.data.acquisitionDate}</Descriptions.Item>
          </Descriptions>
        </div>
        <div className="nodule-list-box">
          <div className="title">结节列表（{props.noduleList?.length}）</div>
          <div className="table-box">
            <div className="table-title">
              <Checkbox disabled checked={true}>
                <div className="num">中心帧</div>
              </Checkbox>
              <div className="lung">肺</div>
              <div className="lobe">肺叶</div>
              <div className="type">类型</div>
              <div className="suggest">建议</div>
              <div className="action">操作</div>
            </div>
            <div id="tableIItemBox" className="table-content">
              {props.noduleList?.map((item, index) => (
                <div
                  key={item.noduleNum}
                  className={`table-item ${item.active ? 'item-active' : ''}`}
                  onClick={e => handleListClick(index, item.num)}
                >
                  <Checkbox onChange={e => props.onCheckChange(index, item.num)} checked={item.checked}>
                    <div className="num">{item.num}</div>
                  </Checkbox>
                  <div className="lung">{item.lung}</div>
                  <div className="lobe">{item.lobe}</div>
                  <div className="type">{item.type}</div>
                  <div className="suggest">{item.suggest}</div>
                  <div className="action">
                    <Popconfirm title="确定删除该结节信息？" okText="确定" cancelText="取消" placement="topRight" onConfirm={e => props.handleDeleteNode(e, item)}>
                      删除
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="image-info-box">
          <div className="info-box">
            <div className="suggest-box">
              <div className="title">结节总结</div>
              <div className="suggest-content">
                <div className="suggest-content-wrap">
                  <TextArea
                    ref={textAreaRef}
                    placeholder="请输入结节总结信息"
                    bordered={false}
                    rows={6}
                    maxLength={150}
                    style={{
                      width: '100%',
                      resize: 'none',
                    }}
                    value={suggest}
                    onChange={e => setSuggest(e.target.value)}
                  />
                </div>
                <div className="save">
                  <Button type="primary" size="small" onClick={handleSave}>
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
