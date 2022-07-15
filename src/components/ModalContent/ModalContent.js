import React, { useState, useEffect} from 'react'
import './ModalContent.scss'
import {readFileInfo, dicomDateTimeToLocale, dicomTimeToLocale, readFileRaw} from "../../util";
import {Button, Input, Tabs} from 'antd'
import daikon from "daikon"
import * as Mark from 'mark.js'
import {ArrowDownOutlined, ArrowUpOutlined} from "@ant-design/icons";

const ModalContent = (props) => {
    const { TabPane } = Tabs;
    const [input1, setInput1] = useState('')
    const [input2, setInput2] = useState('')
    const [searchCurrent, setSearchCurrent] = useState(0)
    const [thisData, setThisData] = useState({
        dict : null,
        meta : null,
        dcmHTML : null
    })
    // console.log('props: ', props.globalData)

    useEffect(() => {
        let selectedPath = null
        let info = null
        let rawInfo = null
        for (let i = 0; i < props.globalData.seriesInfo.length; i ++) {
            if (props.globalData.seriesInfo[i].active) {
                selectedPath = {path: props.globalData.seriesInfo[i].framePath[0]}
            }
        }
        info = readFileInfo(selectedPath)
        rawInfo = readFileRaw(selectedPath)
        const data = new DataView(rawInfo)
        // daikon.Parser.verbose = true;
        // console.log('info: ', info)
        // console.log('daikon: ', daikon.Series.parseImage(data).toString())
        const formatRawData = rawInfoBoxFormat(daikon.Series.parseImage(data).toString())
        setThisData(pr => ({
            ...pr,
            dict: info['dict'],
            meta: info['meta'],
            dcmHTML: formatRawData,
        }))
    }, [])


    const textFormat = (txt) => {
        if (txt) {
            return txt['Value'].toString()
        } else {
            return
        }
    }
    const onSearch = (txt, pageIndex, next) => {
        // console.log(txt)
        const lowerTxt = txt.toLowerCase()
        const markArr = []
        const className = pageIndex === 0 ? '.descriptionBox' : '.rawInfoBox'
        const innerClassName = pageIndex === 0 ? '.descriptionBox .item' : '.rawItem'
        const instance = new Mark(document.querySelectorAll(className)[0])
        instance.unmark()
        instance.mark(lowerTxt, {"separateWordSearch": false})

        for (const element of document.querySelectorAll(innerClassName)) {
            // console.log(element.textContent)
            const innerTxt = element.textContent
            if (txt.length > 0 && innerTxt.toLowerCase().includes(lowerTxt)) {
                markArr.push(element)
            }
        }

        if (next === 'top') {
            // document.querySelectorAll(className)[0].scrollIntoView(true)
        }

        if (markArr.length > 0) {
            if (next === 'up') {
                if (searchCurrent >= 1) {
                    markArr[searchCurrent-1].scrollIntoView()
                    setSearchCurrent(searchCurrent - 1)
                }
            } else if (next === 'down') {
                if (searchCurrent < markArr.length) {
                    markArr[searchCurrent].scrollIntoView()
                    setSearchCurrent(searchCurrent + 1)
                }
            }
        }

    }

    const rawInfoBoxFormat = (content) => {
        let temp =  content.replaceAll('<span', '<div class="rawItem"><span')
        temp = temp.replaceAll('<br />','</div>')
        temp = temp.replaceAll('&nbsp;',' ')
        //
        return temp
        // return content
    }

    const onChange = (key) => {
        // console.log(key);
        setInput1('')
        setInput2('')
        // onSearch('', key === 0 ? 1: 0, 'top')
        onSearch('', 0, 'top')
        onSearch('', 1, 'top')
    }
    const inputChange = (e, index) => {
        if (e.target.value == '') {
            onSearch('', index, 'top')
        }
        if (index === 0) {
            setInput1(e.target.value)
        } else if (index === 1) {
            setInput2(e.target.value)
        }
        setSearchCurrent(0)
    }



  return (
    <div className="modal-content-wrap" >
        {
            thisData.dict ?
                <Tabs defaultActiveKey="0" centered onChange={onChange}>
                    <TabPane tab="关键DICOM属性" key="0">
                        <div className="searchBox">
                            <Input
                                value={input1}
                                placeholder="输入查询字段"
                                allowClear
                                onChange={e => inputChange(e, 0)}
                            />
                            <Button type="primary" className="btn" icon={<ArrowUpOutlined />}
                                    onClick={e => onSearch(input1, 0, 'up')}
                            ></Button>
                            <Button type="primary" className="btn" icon={<ArrowDownOutlined />}
                                    onClick={e => onSearch(input1, 0, 'down')}
                            ></Button>
                        </div>

                        <div className="descriptionBox">
                            <div className="item">
                                <div className="itemHeader">病人信息</div>
                                <div className="itemTxt">{"Patient's Name：" +textFormat(thisData.dict['00100010'])}</div>
                                <div className="itemTxt">{"Patient's ID：" +textFormat(thisData?.dict['00100020'])}</div>
                                <div className="itemTxt">{"Patient's Gender：" +textFormat(thisData?.dict['00100040'])}</div>
                                <div className="itemTxt">{"Patient's Birth Date：" +textFormat(thisData?.dict['00100030'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">CT机生产商信息</div>
                                <div className="itemTxt">{"Manufacturer：" +textFormat(thisData?.dict['00080070'])}</div>
                                <div className="itemTxt">{"Manufacturer's Model Name：" +textFormat(thisData?.dict['00081090'] ? thisData?.dict['00081090'] : 'No Model Name')}</div>
                                <div className="itemTxt">{"Station Name：" +textFormat(thisData?.dict['00081010'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">CT检测信息</div>
                                <div className="itemTxt">{"Study Instance UID：" +textFormat(thisData?.dict['0020000D'])}</div>
                                <div className="itemTxt">{"Study Date：" +dicomDateTimeToLocale(textFormat(thisData?.dict['00080020']),'date')}</div>
                                <div className="itemTxt">{"Study Time：" +dicomTimeToLocale(textFormat(thisData?.dict['00080030']))}</div>
                                <div className="itemTxt">{"Study ID：" +textFormat(thisData?.dict['00200010'])}</div>
                                <div className="itemTxt">{"Study Description：" +textFormat(thisData?.dict['00081030'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">序列</div>
                                <div className="itemTxt">{"Series Instance UlD：" + textFormat(thisData?.dict['0020000E'])}</div>
                                <div className="itemTxt">{"Series Date：" + dicomDateTimeToLocale(textFormat(thisData?.dict['00080021']),'date')}</div>
                                <div className="itemTxt">{"Series Time：" +dicomTimeToLocale(textFormat(thisData?.dict['00080031']))}</div>
                                <div className="itemTxt">{"Series Number：" +textFormat(thisData?.dict['00200011'])}</div>
                                <div className="itemTxt">{"Modality：" +textFormat(thisData?.dict['00080060'])}</div>
                                <div className="itemTxt">{"Institution Name：" +textFormat(thisData?.dict['00080080'] ? thisData?.dict['00080080'] : 'No Institution')}</div>
                                <div className="itemTxt">{"Series Description：" +textFormat(thisData?.dict['0008103E'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">DICOM对象</div>
                                <div className="itemTxt">{"SOP Instance UID：" +textFormat(thisData?.dict['00080018'])}</div>
                                <div className="itemTxt">{"Image Type：" +textFormat(thisData?.dict['00080008'])}</div>
                                <div className="itemTxt">{"Transfer Syntax UID：" +textFormat(thisData.meta['00020010'])}</div>
                                <div className="itemTxt">{"Instance Number：" +textFormat(thisData?.dict['00200013'])}</div>
                                <div className="itemTxt">{"Photometric Interpretation：" +textFormat(thisData?.dict['00280004'])}</div>
                                <div className="itemTxt">{"Samples per Pixel：" +textFormat(thisData?.dict['00280002'])}</div>
                                <div className="itemTxt">{"Pixel Representation：" +textFormat(thisData?.dict['00280103'])}</div>
                                <div className="itemTxt">{"Rows：" +textFormat(thisData?.dict['00280010'])}</div>
                                <div className="itemTxt">{"Columns：" +textFormat(thisData?.dict['00280011'])}</div>
                                <div className="itemTxt">{"Bits Allocated：" +textFormat(thisData?.dict['00280100'])}</div>
                                <div className="itemTxt">{"Bits Stored：" +textFormat(thisData?.dict['00280101'])}</div>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="全部DICOM属性" key="1">
                        <div className="searchBox">
                            <Input
                                value={input2}
                                placeholder="输入查询字段"
                                allowClear
                               onChange={e => inputChange(e, 1)}
                            />
                            <Button type="primary" className="btn" icon={<ArrowUpOutlined />}
                                    onClick={e => onSearch(input2, 1, 'up')}
                            ></Button>
                            <Button type="primary" className="btn" icon={<ArrowDownOutlined />}
                                    onClick={e => onSearch(input2, 1, 'down')}
                            ></Button>
                        </div>
                        <div className="rawInfoBox" dangerouslySetInnerHTML={{__html: thisData?.dcmHTML}}></div>
                    </TabPane>
                </Tabs>
                :null
        }
    </div>
  )
}

export default ModalContent
