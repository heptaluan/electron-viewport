import React, { useState, useEffect } from 'react'
import './ModalContent.scss'
import { readFileInfo, dicomDateTimeToLocale, dicomTimeToLocale } from '../../util'
import { Descriptions } from 'antd'

const ModalContent = props => {
  let selectedPath = null
  console.log('props: ', props.globalData)

  for (let i = 0; i < props.globalData.seriesInfo.length; i++) {
    if (props.globalData.seriesInfo[i].active) {
      selectedPath = { path: props.globalData.seriesInfo[i].framePath.split(',')[0] }
    }
  }
  const info = readFileInfo(selectedPath)
  const dict = info['dict']
  const meta = info['meta']
  console.log('info: ', info)

  const textFormat = txt => {
    if (txt) {
      return txt['Value'].toString()
    }
  }

  return (
    <div className="modal-content-wrap">
      <Descriptions title="病人" column={1}>
        <Descriptions.Item label="Patient's Name">{textFormat(dict['00100010'])}</Descriptions.Item>
        <Descriptions.Item label="Patient ID">{textFormat(dict['00100020'])}</Descriptions.Item>
        <Descriptions.Item label="Patient's Gender">{textFormat(dict['00100040'])}</Descriptions.Item>
        <Descriptions.Item label="Patient's Birth Date">{textFormat(dict['00100030'])}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="CT机生产商信息" column={1}>
        <Descriptions.Item label="Manufacturer">{textFormat(dict['00080070'])}</Descriptions.Item>
        <Descriptions.Item label="Manufacturer's Model Name">{textFormat(dict['00081090'])}</Descriptions.Item>
        <Descriptions.Item label="Station Name">{textFormat(dict['00081010'])}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="CT检测信息" column={1}>
        <Descriptions.Item label="Study Instance UID">{textFormat(dict['0020000D'])}</Descriptions.Item>
        <Descriptions.Item label="Study Date">
          {dicomDateTimeToLocale(textFormat(dict['00080020']), 'date')}
        </Descriptions.Item>
        <Descriptions.Item label="Study Time">{dicomTimeToLocale(textFormat(dict['00080030']))}</Descriptions.Item>
        <Descriptions.Item label="Study ID">{textFormat(dict['00200010'])}</Descriptions.Item>
        <Descriptions.Item label="Study Description">{textFormat(dict['00081030'])}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="序列" column={1}>
        <Descriptions.Item label="Series Instance UlD">{textFormat(dict['0020000E'])}</Descriptions.Item>
        <Descriptions.Item label="Series Date">
          {dicomDateTimeToLocale(textFormat(dict['00080021']), 'date')}
        </Descriptions.Item>
        <Descriptions.Item label="Series Time">{dicomTimeToLocale(textFormat(dict['00080031']))}</Descriptions.Item>
        <Descriptions.Item label="Series Number">{textFormat(dict['00200011'])}</Descriptions.Item>
        <Descriptions.Item label="Modality">{textFormat(dict['00080060'])}</Descriptions.Item>
        <Descriptions.Item label="Institution Name">{textFormat(dict['00080080'])}</Descriptions.Item>
        <Descriptions.Item label="Series Description">{textFormat(dict['0008103E'])}</Descriptions.Item>
      </Descriptions>
      <Descriptions title="DICOM对象" column={1}>
        <Descriptions.Item label="SOP Instance UID">{textFormat(dict['00080018'])}</Descriptions.Item>
        <Descriptions.Item label="Image Type">{textFormat(dict['00080008'])}</Descriptions.Item>
        <Descriptions.Item label="Transfer Syntax UID">{textFormat(meta['00020010'])}</Descriptions.Item>
        <Descriptions.Item label="Instance Number">{textFormat(dict['00200013'])}</Descriptions.Item>
        <Descriptions.Item label="Photometric Interpretation">{textFormat(dict['00280004'])}</Descriptions.Item>
        <Descriptions.Item label="Samples per Pixel">{textFormat(dict['00280002'])}</Descriptions.Item>
        <Descriptions.Item label="Pixel Representation">{textFormat(dict['00280103'])}</Descriptions.Item>
        <Descriptions.Item label="Rows">{textFormat(dict['00280010'])}</Descriptions.Item>
        <Descriptions.Item label="Columns">{textFormat(dict['00280011'])}</Descriptions.Item>
        <Descriptions.Item label="Bits Allocated">{textFormat(dict['00280100'])}</Descriptions.Item>
        <Descriptions.Item label="Bits Stored">{textFormat(dict['00280101'])}</Descriptions.Item>
      </Descriptions>
    </div>
  )
}

export default ModalContent
