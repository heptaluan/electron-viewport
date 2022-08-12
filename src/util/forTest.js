import React, { useState, useEffect} from 'react'
import ModalContent from "../components/ModalContent/ModalContent";

const ForTest = (props) => {
    let keyInfo = '1/2/3/4'
    let timeToLocale = "182232.511000"
    let dateTimeToLocale = "20220720"
    useEffect(() => {

    })

    const dicomDateTimeToLocale = (dateTime, divide) => {
        if (dateTime) {
            const date = new Date(dateTime.substring(0, 4) + '-' + dateTime.substring(4, 6) + '-' + dateTime.substring(6, 8))
            const time = dateTime.substring(9, 11) + ':' + dateTime.substring(11, 13) + ':' + dateTime.substring(13, 15)
            const localeDate = date.toLocaleDateString()
            if (!divide) {
                return `${localeDate} ${time}`
            } else if (divide === 'date') {
                return `${localeDate}`
            } else if (divide === 'time') {
                return `${time}`
            }
        } else {
            return 'Unknown'
        }
    }

    const dicomTimeToLocale = (dateTime) => {
        if (dateTime) {
            const time = dateTime.substring(0, 2) + ':' + dateTime.substring(2, 4) + ':' + dateTime.substring(4, 6)
            return `${time}`
        } else {
            return 'Unknown'
        }

    }

    const keyFormat = txt => {
        keyInfo = txt.replace(/\/|\s/gi, '_')
    }

    return (
        <div className="test-wrap" >
            <div className='keyFormat' onClick={e => keyFormat(keyInfo)}>
                {keyInfo}
            </div>
            <div className='timeToLocale' onClick={e => dicomTimeToLocale(timeToLocale)}>
                {timeToLocale}
            </div>
            <div className='dateTimeToLocale' onClick={e => dicomDateTimeToLocale(dateTimeToLocale)}>
                {dateTimeToLocale}
            </div>

        </div>
    )
}

export default ForTest