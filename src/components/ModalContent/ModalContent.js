import React, { useState, useEffect} from 'react'
import './ModalContent.scss'
import {readFileInfo, dicomDateTimeToLocale, dicomTimeToLocale, readFileRaw} from "../../util";
import { Descriptions, Input, Tabs } from 'antd'
// import ECHighlighter from "react-ec-highlighter";
import daikon from "daikon"

const ModalContent = (props) => {
    const { Search } = Input
    const { TabPane } = Tabs;
    const [input1, setInput1] = useState('')
    const [input2, setInput2] = useState('')
    const [thisData, setThisData] = useState({
        dict : null,
        meta : null,
        dcmHTML : null,
        importantInnerTxt: null,
        allInnerTxt: null,
    })
    // console.log('props: ', props.globalData)

    useEffect(() => {
        let selectedPath = null
        let info = null
        let rawInfo = null
        for (let i = 0; i < props.globalData.seriesInfo.length; i ++) {
            if (props.globalData.seriesInfo[i].active) {
                selectedPath = {path: props.globalData.seriesInfo[i].framePath.split(',')[0]}
            }
        }
        info = readFileInfo(selectedPath)
        rawInfo = readFileRaw(selectedPath)
        const data = new DataView(rawInfo)
        // daikon.Parser.verbose = true;
        console.log('info: ', info)
        console.log('daikon: ', daikon.Series.parseImage(data))
        // const a = daikon.Series.parseImage(data)
        // console.log('daikon: ', a.toHTMLString(1))
        setThisData(pr => ({
            ...pr,
            dict: info['dict'],
            meta: info['meta'],
            dcmHTML: daikon.Series.parseImage(data).toString(),
            importantInnerTxt: document.querySelectorAll('.descriptionBox').textContent,
            allInnerTxt: document.querySelectorAll('.rawInfoBox').textContent
        }))
    }, [])

    // console.log(a)

    const textFormat = (txt) => {
        if (txt) {
            return txt['Value'].toString()
        }
    }
    const onSearch = (txt, pageIndex) => {
        console.log(txt)
        const lowerTxt = txt.toLowerCase()
        const markArr = []
        const className = pageIndex === 0 ? '.descriptionBox .itemTxt' : '.rawInfoBox'
        for (const element of document.querySelectorAll(className)) {
            // console.log(element.textContent)
            const innerTxt = element.textContent
            // element.textContent = innerTxt.replace(/<(\/*)mark*>/g, '');
            if (txt.length > 0 && innerTxt.toLowerCase().includes(lowerTxt)) {
                // element.textContent = innerTxt.replace(new RegExp(lowerTxt, "gi"), (match) => `<mark>${match}</mark>`);
                markArr.push(element)
            }
        }
        if (markArr.length > 0) {
            markArr[0].scrollIntoView()
        }
    }

    const onChange = (key) => {
        // console.log(key);
        setInput1('')
        setInput2('')
        onSearch('', 0)
        onSearch('', 1)
    }
    const inputChange = (e, index) => {
        if (index === 0) {
            setInput1(e.target.value)
        } else if (index === 1) {
            setInput2(e.target.value)
        }
    }



  return (
    <div className="modal-content-wrap" >
        {
            thisData.dict ?
                <Tabs defaultActiveKey="1" centered onChange={onChange}>
                    <TabPane tab="关键DICOM属性" key="1">
                        <Search
                            value={input1}
                            placeholder="输入查询字段"
                            allowClear
                            enterButton="搜索"
                            onChange={e => inputChange(e, 0)}
                            onSearch={e => onSearch(e, 0)}
                        />
                        {/* {thisData.importantInnerTxt ?
                            <div>
                                111<ECHighlighter
                                searchPhrase={input1}
                                text={thisData?.importantInnerTxt}
                            /> 222
                            </div>
                            : null
                        } */}

                        <div className="descriptionBox">



                            <div className="item">
                                <div className="itemHeader">病人信息</div>
                                <div className="itemTxt"><span>Patient's Name：</span>{textFormat(thisData.dict['00100010'])}</div>
                                <div className="itemTxt"><span>Patient's ID：</span>{textFormat(thisData?.dict['00100020'])}</div>
                                <div className="itemTxt"><span>Patient's Gender：</span>{textFormat(thisData?.dict['00100040'])}</div>
                                <div className="itemTxt"><span>Patient's Name：</span>{textFormat(thisData?.dict['00100030'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">CT机生产商信息</div>
                                <div className="itemTxt"><span>Manufacturer：</span>{textFormat(thisData?.dict['00080070'])}</div>
                                <div className="itemTxt"><span>Manufacturer's Model Name：</span>{textFormat(thisData?.dict['00081090'])}</div>
                                <div className="itemTxt"><span>Station Name：</span>{textFormat(thisData?.dict['00081010'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">CT检测信息</div>
                                <div className="itemTxt"><span>Study Instance UID：</span>{textFormat(thisData?.dict['0020000D'])}</div>
                                <div className="itemTxt"><span>Study Date：</span>{dicomDateTimeToLocale(textFormat(thisData?.dict['00080020']),'date')}</div>
                                <div className="itemTxt"><span>Study Time：</span>{dicomTimeToLocale(textFormat(thisData?.dict['00080030']))}</div>
                                <div className="itemTxt"><span>Study ID：</span>{textFormat(thisData?.dict['00200010'])}</div>
                                <div className="itemTxt"><span>Study Description：</span>{textFormat(thisData?.dict['00081030'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">序列</div>
                                <div className="itemTxt"><span>Series Instance UlD：</span>{textFormat(thisData?.dict['0020000E'])}</div>
                                <div className="itemTxt"><span>Series Date：</span>{dicomDateTimeToLocale(textFormat(thisData?.dict['00080021']),'date')}</div>
                                <div className="itemTxt"><span>Series Time：</span>{dicomTimeToLocale(textFormat(thisData?.dict['00080031']))}</div>
                                <div className="itemTxt"><span>Series Number：</span>{textFormat(thisData?.dict['00200011'])}</div>
                                <div className="itemTxt"><span>Modality：</span>{textFormat(thisData?.dict['00080060'])}</div>
                                <div className="itemTxt"><span>Institution Name：</span>{textFormat(thisData?.dict['00080080'])}</div>
                                <div className="itemTxt"><span>Series Description：</span>{textFormat(thisData?.dict['0008103E'])}</div>
                            </div>
                            <div className="item">
                                <div className="itemHeader">DICOM对象</div>
                                <div className="itemTxt"><span>SOP Instance UID：</span>{textFormat(thisData?.dict['00080018'])}</div>
                                <div className="itemTxt"><span>Image Type：</span>{textFormat(thisData?.dict['00080008'])}</div>
                                <div className="itemTxt"><span>Transfer Syntax UID：</span>{textFormat(thisData.meta['00020010'])}</div>
                                <div className="itemTxt"><span>Instance Number：</span>{textFormat(thisData?.dict['00200013'])}</div>
                                <div className="itemTxt"><span>Photometric Interpretation：</span>{textFormat(thisData?.dict['00280004'])}</div>
                                <div className="itemTxt"><span>Samples per Pixel：</span>{textFormat(thisData?.dict['00280002'])}</div>
                                <div className="itemTxt"><span>Pixel Representation：</span>{textFormat(thisData?.dict['00280103'])}</div>
                                <div className="itemTxt"><span>Rows：</span>{textFormat(thisData?.dict['00280010'])}</div>
                                <div className="itemTxt"><span>Columns：</span>{textFormat(thisData?.dict['00280011'])}</div>
                                <div className="itemTxt"><span>Bits Allocated：</span>{textFormat(thisData?.dict['00280100'])}</div>
                                <div className="itemTxt"><span>Bits Stored：</span>{textFormat(thisData?.dict['00280101'])}</div>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="全部DICOM属性" key="2">
                        <Search
                            placeholder="输入查询字段"
                            allowClear
                            value={input2}
                            enterButton="搜索"
                            onChange={e => inputChange(e, 1)}
                            onSearch={e => onSearch(e, 1)}
                        />
                        <div className="rawInfoBox" dangerouslySetInnerHTML={{__html: thisData?.dcmHTML}}></div>
                    </TabPane>
                </Tabs>
                :null
        }
    </div>
  )
}

export default ModalContent
