import React, { useState, useEffect } from 'react'
import './CustomOverlay.scss'
import cornerstone from 'cornerstone-core'
import { dicomDateTimeToLocale } from '../../../util/index'

const CustomOverlay = props => {
  // console.log(cornerstone.getImage(document.querySelector('.viewport-element')))
  // console.log(props)

  const [data, setData] = useState(null)

  useEffect(() => {
    cornerstone.loadImage(props.imageId).then(image => {
      console.log(image)
      const data = {
        name: image.data.string('x00100010'),
        birth: image.data.string('x00100030'),
        patientId: image.data.string('x00100020'),
        sex: image.data.string('x00100040'),

        hospital: image.data.string('x00080080'),
        studyID: image.data.string('x00200010'),
        day: dicomDateTimeToLocale(image.data.string('x00080022') + '.' + image.data.string('x00080032'), 'date'),
        time: dicomDateTimeToLocale(image.data.string('x00080022') + '.' + image.data.string('x00080032'), 'time'),

        seriesNo: image.data.string('x00200011'),
        seriesDescription: image.data.string('x0008103e'),
        
        sliceThickness: image.data.string('x00180050'),
        sliceLocation: image.data.string('x00201041'),

        Rowsize: image.rows,
        Colsize: image.columns,
      }

      setData(data)
    })
  }, [props.imageId])

  return (
    <div className="custom-overlay-box">
      <div className="top-box">
        <div>
          <div className="list">
            姓名：<span>{data?.name}</span>
          </div>
          <div className="list">
            生日：<span>{data?.birth}</span>
          </div>
          <div className="list">
            Patient ID：<span>{data?.patientId}</span>
          </div>
          <div className="list">
            性别：<span>{data?.sex === '**' ? data?.sex : data?.sex === 'M' ? '男' : '女'}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="list">
            医院：<span>{data?.hospital}</span>
          </div>
          <div className="list">
            检测ID：<span>{data?.studyID}</span>
          </div>
          <div className="list">
            检查日期：<span>{data?.day}</span>
          </div>
          <div className="list">
            检查时间：<span>{data?.time}</span>
          </div>
        </div>
      </div>
      <div className="bottom-box">
        <div>
          <div className="list">
            图像帧：
            <span>
              {props.imageIndex - 1} / {props.stackSize}
            </span>
          </div>
          <div className="list">
            缩放：<span>{props.scale.toFixed(2)}</span>
          </div>
          <div className="list">
            窗口/层级：
            <span>
              {Number(props.windowWidth).toFixed(2)} / {Number(props.windowCenter).toFixed(2)}{' '}
            </span>
          </div>
          <div className="list">
            大小：<span>{`${data?.Rowsize} x ${data?.Colsize}`}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="list">
            序列号：<span>{data?.seriesNo}</span>
          </div>
          <div className="list">
            序列描述：<span>{data?.seriesDescription ? data?.seriesDescription : '暂无描述'}</span>
          </div>
          <div className="list">
            层厚：<span>{data?.sliceThickness} mm</span>
          </div>
          <div className="list">
            位置：<span>{data?.sliceLocation} mm</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomOverlay
