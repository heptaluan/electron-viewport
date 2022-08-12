import React from 'react'
import {shallow} from 'enzyme';
import {expect} from 'chai';
import ForTest from './forTest'

describe('ForTest 组件', () => {
    it('测试头文件格式', () => {
        const props = {
            dicomDateTimeToLocale: jest.fn(),
            dicomTimeToLocale: jest.fn(),
            keyFormat: jest.fn(),
        }
        const box = shallow(<ForTest />)
        const keyBox = box.find('.keyFormat')
        keyBox.simulate('click')
        setTimeout(()=> {
            console.log('in: ', keyBox.text())
            expect(keyBox.text()).to.equal('1_2_3_4')
        },1000)
    })
})

describe('ForTest 组件', () => {
    it('测试当日时间格式处理', () => {
        const box = shallow(<ForTest />)
        const timeToLocaleBox = box.find('.timeToLocale')
        timeToLocaleBox.simulate('click')
        setTimeout(()=> {
            console.log('in: ', timeToLocaleBox.text())
            expect(timeToLocaleBox.text()).to.equal("18:22:32")
        },1000)
    })
})

describe('ForTest 组件', () => {
    it('测试日期格式处理', () => {
        const box = shallow(<ForTest />)
        const dateTimeToLocaleBox = box.find('.dateTimeToLocale')
        dateTimeToLocaleBox.simulate('click')
        setTimeout(()=> {
            console.log('in: ', dateTimeToLocaleBox.text())
            expect(dateTimeToLocaleBox.text()).to.equal("2022/7/20")
        },1000)
    })
})
