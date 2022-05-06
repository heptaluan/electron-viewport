import React from 'react'
import './NoduleInfo.scss'
import { Radio, Select, Button, Input } from 'antd'

const { Option } = Select

const NoduleInfo = props => {
  const onLungChange = e => {
    props.checkNoduleList(e.target.value, 'lung')
    if (e.target.value === '左肺' && props.noduleInfo.lobe === '中叶') {
      props.checkNoduleList('上叶', 'lobe')
    }
  }

  const onLobeChange = e => {
    props.checkNoduleList(e.target.value, 'lobe')
  }

  const handleSelectChange = val => {
    props.checkNoduleList(val, 'type')
  }

  return (
    <div className="nodule-info-box">
      {props.noduleInfo ? (
        <div className="nodule-detail">
          {/* <div className="list">
            <em>影像层：</em>
            {props.noduleInfo.num}
          </div> */}
          <div className="list">
            <span className="list-title">肺：</span>
            <Radio.Group disabled={props.pageState === 'admin'} onChange={onLungChange} value={props.noduleInfo.lung}>
              <Radio value={'右肺'}>右肺</Radio>
              <Radio value={'左肺'}>左肺</Radio>
            </Radio.Group>
          </div>
          <div className="list">
            <div className="list-title">肺叶：</div>
            <Radio.Group disabled={props.pageState === 'admin'} onChange={onLobeChange} value={props.noduleInfo.lobe}>
              <Radio value={'上叶'}>上叶</Radio>
              {props.noduleInfo.lung === '左肺' ? null : <Radio value={'中叶'}>中叶</Radio>}
              <Radio value={'下叶'}>下叶</Radio>
            </Radio.Group>
          </div>
          <div className="list">
            <div className="list-title">类型：</div>
            <Select
              disabled={props.pageState === 'admin'}
              size="small"
              value={props.noduleInfo.type}
              style={{ width: 150, fontSize: 13 }}
              onChange={handleSelectChange}
            >
              <Option value="肺内实性">肺内实性</Option>
              <Option value="部分实性">部分实性</Option>
              <Option value="磨玻璃">磨玻璃</Option>
              <Option value="肺内钙化">肺内钙化</Option>
              <Option value="胸膜实性">胸膜实性</Option>
              <Option value="胸膜钙化">胸膜钙化</Option>
              <Option value="其他">其他</Option>
            </Select>
          </div>
          <div className="list">
            <em>建议：</em>
            <Input
              disabled={props.pageState === 'admin'}
              placeholder="这里输入结节备注信息"
              size="small"
              style={{ width: 150, height: 24, marginTop: 2, fontSize: 13 }}
              onChange={props.handleTextareaOnChange}
              onBlur={props.handleInputBlur}
              value={props.noduleInfo?.suggest}
            />
          </div>
          <div className="list">
            <em>大小：</em>
            {props.noduleInfo.size}
          </div>
          <div className="list">
            <em>体积：</em>
            {props.noduleInfo.noduleSize} mm³
          </div>
          {/* <div className="list">
            <em>形态类型：</em>
            {props.noduleInfo.type}
          </div> */}
        </div>
      ) : null}
      {props.noduleInfo ? (
        <div className="check-group">
          <div className="group-wrap">
            <span>是否为结节</span>
            <div className="group">
              <Button
                disabled={props.pageState === 'admin'}
                type={props.noduleInfo.state === false ? 'primary' : null}
                style={{ marginRight: '10px' }}
                size="small"
                onClick={e => props.updateNoduleList(false)}
              >
                否
              </Button>
              <Button
                disabled={props.pageState === 'admin'}
                type={props.noduleInfo.state === true ? 'primary' : null}
                size="small"
                onClick={e => props.updateNoduleList(true)}
              >
                是
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NoduleInfo
