import React from 'react'
import './About.scss'

const About = props => {
  return (
    <div className="modal-content-wrap">
        <div className="infoList">
            <div className="info">
                <div className="label">产品名称</div>
                <div className="txt">医学影像处理软件</div>
            </div>
            <div className="info">
                <div className="label">型号规格</div>
                <div className="txt">TL-AI001</div>
            </div>
            <div className="info">
                <div className="label">发布版本</div>
                <div className="txt">V1</div>
            </div>
            <div className="info">
                <div className="label">完整版本</div>
                <div className="txt">V1.0.4.0</div>
            </div>
            <div className="info">
                <div className="label">注册证号</div>
                <div className="txt"></div>
            </div>
            <div className="info">
                <div className="label">注册人</div>
                <div className="txt">成都泰莱医学检验实验室有限公司</div>
            </div>
        </div>

      <div className="footer">Copyright © 2022 Tailai. All Right Reserved. 泰莱公司 版权所有</div>
    </div>
  )
}

export default About
