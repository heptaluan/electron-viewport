import React from 'react'
import './SelectFile.scss'
import { Button } from 'antd'

const SelectFile = (props) => {
  return (
    <div className="select-file-box">
      <Button>导入</Button>
      <Button>光盘导入</Button>
      <Button>导出</Button>
    </div>
  )
}

export default SelectFile
