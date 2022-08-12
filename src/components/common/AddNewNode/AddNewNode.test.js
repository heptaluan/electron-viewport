import React from 'react'
import { render, fireEvent, mount } from '@testing-library/react'
import AddNewNode from './AddNewNode'


describe('AddNewNode 组件', () => {
    it('测试组件初始化后的状态', () => {
        const props = {
            toolList: [],
            imagesConfig:[],
            cornerstoneElement: [],
            updateToolList: jest.fn(),
            handleToolListTextareaChange: jest.fn(),
            handleToolListTextareaBlur: jest.fn(),
        }

        const box = render(<AddNewNode {...props} />)

        expect(box).not.toBeNull()
    })

    it('测试结节列表状态', () => {
        const props = {
            toolList: [
                {
                    uuid: 1,
                    lung: 1,
                    lobe: 1,
                    type: 1,
                    suggest: 1
                },
                {
                    uuid: 2,
                    lung: 2,
                    lobe: 2,
                    type: 2,
                    suggest: 2
                },
                {
                    uuid: 3,
                    lung: 3,
                    lobe: 3,
                    type: 3,
                    suggest: 3
                },
            ],
            imagesConfig:[],
            cornerstoneElement: [],
            updateToolList: jest.fn(),
            handleToolListTextareaChange: jest.fn(),
            handleToolListTextareaBlur: jest.fn(),
        }

        const box = render(<AddNewNode {...props} />)

        const list = box.queryAllByTestId('nodeList')
        // 列表是否正常渲染
        expect(list).toHaveLength(3)
    })
})
