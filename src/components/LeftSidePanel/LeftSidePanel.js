import React from 'react'
import './LeftSidePanel.scss'
import { Tag } from 'antd'

const LeftSidePanel = props => {
    // console.log('p: ', props)
    const methods = {
        changeActive(item) {
            props.data.map(good => good.active = false)
            item.active = true
        }
    }
  return (
    <div className="left-side-panel-box">
      <div className="list-box-wrap">
        <div className="list-box">
          {props.data?.length === 0 ? (
            <div className="empty">暂无序列</div>
          ) : (
            props.data?.map((item, index) => (
              <div key={item.key} onClick={e => {
                  props.handleSequenceListClick(item.instanceUid)
                  methods.changeActive(item)
              }
              } className={item.active ? 'active list-item': 'list-item'}>
                {/*<div className="num">序列：{item.seriesDescription}</div>*/}
                  <div className='img-box'>
                      <img src={item['src']} alt="cover" />
                      <div className='sequence-num'>
                          <Tag color="orange">{item.tag}</Tag>
                      </div>
                  </div>
                  <div className='list-detail'>
                      {item['date']}
                  </div>
              </div>
            ))
          )}
        </div>

        {/*<div className='list-box active'>*/}
        {/*  <div className='img-box'>*/}
        {/*    <img src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" alt="cover" />*/}
        {/*    <div className='sequence-num'>*/}
        {/*      <Tag color="orange">502</Tag>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  <div className='list-detail'>*/}
        {/*    2022年05月01日*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/*<div className='list-box'>*/}
        {/*  <div className='img-box'>*/}
        {/*    <img src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" alt="cover" />*/}
        {/*    <div className='sequence-num'>*/}
        {/*      <Tag color="orange">502</Tag>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  <div className='list-detail'>*/}
        {/*    2022年05月01日*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/*<div className='list-box'>*/}
        {/*  <div className='img-box'>*/}
        {/*    <img src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" alt="cover" />*/}
        {/*    <div className='sequence-num'>*/}
        {/*      <Tag color="orange">502</Tag>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*  <div className='list-detail'>*/}
        {/*    2022年05月01日*/}
        {/*  </div>*/}
        {/*</div>*/}


      </div>
    </div>
  )
}

export default LeftSidePanel
