import React from 'react'
import { render, fireEvent, mount } from '@testing-library/react'
import About from './About'

describe('About 组件', () => {
    it('测试组件初始化后的状态', () => {
        const props = {
        }

        const box = render(<About {...props} />)

        expect(box).not.toBeNull()
    })
})

