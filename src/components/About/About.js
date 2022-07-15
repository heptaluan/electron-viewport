import React from 'react'
import './About.scss';

const About = (props) => {

    return (
        <div className="modal-content-wrap" >
            <div className='info'>
                <div className='label'>
                    版本信息
                </div>
                <div className='txt'>
                    医学影像处理软件V0.1.1
                </div>
            </div>
            <div className='footer'>
                Copyright © 2022 Tailai. All Right Reserved. 泰莱公司 版权所有
            </div>
        </div>
    )
}

export default About
