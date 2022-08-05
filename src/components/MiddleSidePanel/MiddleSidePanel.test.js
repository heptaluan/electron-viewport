import React from 'react'
import { render, fireEvent, mount } from '@testing-library/react'
import MiddleSidePanel from './MiddleSidePanel'

describe('MiddleSidePanel 组件', () => {
  it('测试组件初始化后的状态', () => {
    const props = {
      data: {
        patientName: '',
        patientGender: '',
        patientBirthday: '',
        patientID: '',
        acquisitionDate: '',
      },
      noduleList: [],
      noduleSuggest: '',
      onCheckChange: jest.fn(),
      handleTextareaOnChange: jest.fn(),
    }

    const box = render(<MiddleSidePanel {...props} />)

    expect(box).not.toBeNull()
  })

  it('测试结节列表状态', () => {
    const props = {
      data: {
        patientName: '',
        patientGender: '',
        patientBirthday: '',
        patientID: '',
        acquisitionDate: '',
      },
      noduleList: [
        {
          noduleNum: 1,
          num: 1,
          lung: 1,
          lobe: 1,
          type: 1,
          suggest: 1,
        },
        {
          noduleNum: 2,
          num: 2,
          lung: 2,
          lobe: 2,
          type: 2,
          suggest: 2,
        },
      ],
      noduleSuggest: '',
      onCheckChange: jest.fn(),
      handleTextareaOnChange: jest.fn(),
      handleDeleteNode: jest.fn(),
    }

    const box = render(<MiddleSidePanel {...props} />)

    const list = box.queryAllByTestId('list-item')
    // 列表是否正常渲染
    expect(list).toHaveLength(2)
  })

})
